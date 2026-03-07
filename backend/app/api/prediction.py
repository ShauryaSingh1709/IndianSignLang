from fastapi import APIRouter
from pydantic import BaseModel
import numpy as np
import base64
import cv2
import mediapipe as mp
import tensorflow as tf
import pickle
import json
import time
from typing import List, Optional, Dict, Any
from app.core.config import settings

router = APIRouter()

# ============================================
# ML MODEL MANAGER (Singleton Pattern)
# ============================================
class MLModelManager:
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialized = False
        return cls._instance
    
    def __init__(self):
        if self._initialized:
            return
        self._initialized = True
        self.load_models()
    
    def load_models(self):
        """Load all ML models and initialize MediaPipe"""
        print("=" * 50)
        print("🔄 Loading ML Models...")
        print("=" * 50)
        
        try:
            # Load TensorFlow model
            model_path = str(settings.MODEL_PATH)
            print(f"📂 Loading model from: {model_path}")
            self.model = tf.keras.models.load_model(model_path)
            print(f"✅ TensorFlow model loaded successfully!")
            
            # Load label encoder
            encoder_path = str(settings.LABEL_ENCODER_PATH)
            print(f"📂 Loading label encoder from: {encoder_path}")
            with open(encoder_path, 'rb') as f:
                self.label_encoder = pickle.load(f)
            print(f"✅ Label encoder loaded successfully!")
            
            # Load or create class mapping
            try:
                mapping_path = str(settings.CLASS_MAPPING_PATH)
                with open(mapping_path, 'r') as f:
                    self.class_mapping = json.load(f)
                print(f"✅ Class mapping loaded from file")
            except FileNotFoundError:
                # Create mapping from label encoder
                self.class_mapping = {
                    str(i): str(label) 
                    for i, label in enumerate(self.label_encoder.classes_)
                }
                print("⚠️ Class mapping created from label encoder")
            
            # Store class names
            self.classes = [str(c) for c in self.label_encoder.classes_]
            print(f"📝 Available classes ({len(self.classes)}): {self.classes}")
            
            # Initialize MediaPipe Hands
            print("🖐️ Initializing MediaPipe Hands...")
            self.mp_hands = mp.solutions.hands
            self.hands = self.mp_hands.Hands(
                static_image_mode=True,
                max_num_hands=2,
                min_detection_confidence=0.7,
                min_tracking_confidence=0.7
            )
            
            print("=" * 50)
            print("✅ All ML Models loaded successfully!")
            print("=" * 50)
            
        except Exception as e:
            print("=" * 50)
            print(f"❌ ERROR loading models: {e}")
            print("=" * 50)
            import traceback
            traceback.print_exc()
            
            # Set to None on failure
            self.model = None
            self.label_encoder = None
            self.class_mapping = {}
            self.classes = []
            self.hands = None
    
    def is_ready(self) -> bool:
        """Check if all models are loaded"""
        return (
            self.model is not None and 
            self.label_encoder is not None and 
            self.hands is not None
        )

# Initialize model manager
ml_manager = MLModelManager()

# ============================================
# PYDANTIC SCHEMAS
# ============================================
class PredictionRequest(BaseModel):
    image: str
    expected: Optional[str] = None

class LandmarkPoint(BaseModel):
    x: float
    y: float
    z: float

class TopPrediction(BaseModel):
    class_name: str = None
    confidence: float = 0

class PredictionResult(BaseModel):
    success: bool
    predicted: Optional[str] = None
    confidence: float = 0
    isCorrect: bool = False
    expected: Optional[str] = None
    error: Optional[str] = None
    handDetected: bool = False
    processingTime: Optional[float] = None
    topPredictions: Optional[List[Dict[str, Any]]] = None
    feedback: Optional[str] = None
    landmarks: Optional[List[Dict[str, float]]] = None
    handsCount: int = 0

# ============================================
# HELPER FUNCTIONS
# ============================================
def decode_base64_image(image_base64: str) -> Optional[np.ndarray]:
    """Decode base64 string to OpenCV image"""
    try:
        # Remove data URL prefix if present
        if ',' in image_base64:
            image_base64 = image_base64.split(',')[1]
        
        # Decode base64
        image_data = base64.b64decode(image_base64)
        nparr = np.frombuffer(image_data, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        return image
    except Exception as e:
        print(f"Error decoding image: {e}")
        return None

def extract_hand_landmarks(hands_processor, image: np.ndarray) -> tuple:
    """
    Extract hand landmarks from image using MediaPipe
    Returns: (landmarks_array, landmarks_for_frontend, hands_count)
    """
    # Convert to RGB
    image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    
    # Process image
    results = hands_processor.process(image_rgb)
    
    # No hands detected
    if not results.multi_hand_landmarks:
        return None, [], 0
    
    hands_data = []
    landmarks_for_frontend = []
    
    # Process each detected hand
    for hand_idx, hand_lm in enumerate(results.multi_hand_landmarks):
        # Calculate average x position for sorting (left to right)
        x_coords = [lm.x for lm in hand_lm.landmark]
        avg_x = np.mean(x_coords)
        hands_data.append((avg_x, hand_lm))
        
        # Store landmarks for frontend visualization
        # Each hand has 21 landmarks
        for lm in hand_lm.landmark:
            landmarks_for_frontend.append({
                "x": float(lm.x),
                "y": float(lm.y),
                "z": float(lm.z)
            })
    
    # Sort hands by x position (left to right)
    hands_data.sort(key=lambda x: x[0])
    
    # Extract features for model
    landmarks = []
    for _, hand_lm in hands_data:
        for lm in hand_lm.landmark:
            landmarks.extend([lm.x, lm.y, lm.z])
    
    # Pad if only one hand detected (model expects 126 features = 2 hands × 21 landmarks × 3 coords)
    if len(hands_data) == 1:
        landmarks.extend([0.0] * 63)  # Pad with zeros for second hand
    
    # Ensure exactly 126 features
    landmarks = np.array(landmarks[:126], dtype=np.float32)
    
    return landmarks, landmarks_for_frontend, len(hands_data)

def normalize_landmarks(landmarks: np.ndarray) -> np.ndarray:
    """Normalize landmarks using palm normalization"""
    # Reshape to (42, 3) - 42 landmarks with x, y, z
    landmarks_reshaped = landmarks.reshape(42, 3)
    
    # Translate so wrist (landmark 0) is at origin
    wrist = landmarks_reshaped[0].copy()
    landmarks_reshaped -= wrist
    
    # Scale by palm size (distance from wrist to middle finger MCP - landmark 9)
    palm_size = np.linalg.norm(landmarks_reshaped[9])
    if palm_size > 0:
        landmarks_reshaped /= palm_size
    
    # Flatten and reshape for model input
    return landmarks_reshaped.flatten().reshape(1, -1)

def generate_feedback(predicted: str, confidence: float, expected: Optional[str], is_correct: bool) -> str:
    """Generate user-friendly feedback message"""
    if expected:
        if is_correct:
            if confidence > 90:
                return f"🌟 Excellent! Perfect '{predicted}' sign!"
            elif confidence > 80:
                return f"✅ Great job! '{predicted}' recognized!"
            elif confidence > 70:
                return f"👍 Good! '{predicted}' detected correctly."
            else:
                return f"✓ Correct! '{predicted}' recognized."
        else:
            return f"🔄 Detected '{predicted}' ({confidence:.0f}%) - Show '{expected}'"
    else:
        if confidence > 85:
            return f"✅ '{predicted}' detected with high confidence!"
        elif confidence > 70:
            return f"👍 '{predicted}' detected ({confidence:.0f}%)"
        else:
            return f"🤔 Possibly '{predicted}' - Hold steady for better accuracy"

# ============================================
# API ENDPOINTS
# ============================================
@router.get("/health")
async def prediction_health():
    """Check if ML model is loaded and ready"""
    return {
        "status": "ready" if ml_manager.is_ready() else "model_not_loaded",
        "model": {
            "modelLoaded": ml_manager.model is not None,
            "encoderLoaded": ml_manager.label_encoder is not None,
            "mediapipeLoaded": ml_manager.hands is not None,
            "classes": ml_manager.classes,
            "numClasses": len(ml_manager.classes)
        }
    }

@router.get("/classes")
async def get_classes():
    """Get available sign language classes"""
    return {
        "classes": ml_manager.classes,
        "count": len(ml_manager.classes),
        "mapping": ml_manager.class_mapping
    }

@router.post("/")
async def predict_sign(request: PredictionRequest) -> PredictionResult:
    """
    Predict ISL sign from base64 encoded image
    Returns prediction with hand landmarks for visualization
    """
    start_time = time.time()
    
    # Check if model is ready
    if not ml_manager.is_ready():
        return PredictionResult(
            success=False,
            error="ML Model not loaded. Please check backend logs.",
            handDetected=False
        )
    
    try:
        # 1. Decode image
        image = decode_base64_image(request.image)
        if image is None:
            return PredictionResult(
                success=False,
                error="Invalid image data - could not decode",
                handDetected=False
            )
        
        # 2. Extract hand landmarks
        landmarks, landmarks_for_frontend, hands_count = extract_hand_landmarks(
            ml_manager.hands, 
            image
        )
        
        # No hands detected
        if landmarks is None:
            return PredictionResult(
                success=False,
                error="No hand detected in image",
                handDetected=False,
                landmarks=[],
                handsCount=0,
                feedback="👋 Show your hand clearly to the camera"
            )
        
        # 3. Normalize landmarks
        landmarks_normalized = normalize_landmarks(landmarks)
        
        # 4. Make prediction
        predictions = ml_manager.model.predict(landmarks_normalized, verbose=0)[0]
        
        # 5. Get best prediction
        predicted_idx = int(np.argmax(predictions))
        confidence = float(predictions[predicted_idx]) * 100
        
        # Get predicted class name
        if str(predicted_idx) in ml_manager.class_mapping:
            predicted_class = ml_manager.class_mapping[str(predicted_idx)]
        elif predicted_idx < len(ml_manager.classes):
            predicted_class = ml_manager.classes[predicted_idx]
        else:
            predicted_class = "Unknown"
        
        # 6. Check if correct
        is_correct = False
        if request.expected:
            is_correct = predicted_class.upper() == request.expected.upper()
        
        # 7. Get top 5 predictions
        top_indices = np.argsort(predictions)[::-1][:5]
        top_predictions = []
        for idx in top_indices:
            if str(idx) in ml_manager.class_mapping:
                class_name = ml_manager.class_mapping[str(idx)]
            elif idx < len(ml_manager.classes):
                class_name = ml_manager.classes[idx]
            else:
                class_name = f"Class_{idx}"
            
            top_predictions.append({
                "class": class_name,
                "confidence": round(float(predictions[idx]) * 100, 1)
            })
        
        # 8. Generate feedback
        feedback = generate_feedback(predicted_class, confidence, request.expected, is_correct)
        
        # 9. Calculate processing time
        processing_time = (time.time() - start_time) * 1000
        
        # 10. Return result with landmarks
        return PredictionResult(
            success=True,
            predicted=predicted_class,
            confidence=round(confidence, 1),
            isCorrect=is_correct,
            expected=request.expected,
            handDetected=True,
            processingTime=round(processing_time, 1),
            topPredictions=top_predictions,
            feedback=feedback,
            landmarks=landmarks_for_frontend,
            handsCount=hands_count
        )
        
    except Exception as e:
        print(f"❌ Prediction error: {e}")
        import traceback
        traceback.print_exc()
        
        return PredictionResult(
            success=False,
            error=f"Prediction failed: {str(e)}",
            handDetected=False
        )

@router.post("/batch")
async def predict_batch(images: List[str], expected: Optional[List[str]] = None):
    """Predict multiple images at once (for quiz mode)"""
    results = []
    
    for i, image_base64 in enumerate(images):
        exp = expected[i] if expected and i < len(expected) else None
        request = PredictionRequest(image=image_base64, expected=exp)
        result = await predict_sign(request)
        results.append(result)
    
    correct_count = sum(1 for r in results if r.isCorrect)
    
    return {
        "results": results,
        "total": len(results),
        "correct": correct_count,
        "accuracy": round(correct_count / len(results) * 100, 1) if results else 0
    }

@router.get("/tips/{sign_letter}")
async def get_sign_tips(sign_letter: str):
    """Get tips for performing a specific sign"""
    tips_database = {
        "A": [
            "Make a fist with your thumb resting on the side",
            "Keep your palm facing forward",
            "Thumb should be visible, not tucked inside"
        ],
        "B": [
            "Extend all four fingers straight up together",
            "Tuck your thumb across your palm",
            "Keep fingers close together, not spread"
        ],
        "C": [
            "Curve your hand like you're holding a small ball",
            "Fingers and thumb should form a 'C' shape",
            "Keep the curve smooth and rounded"
        ],
        "D": [
            "Touch your thumb to your middle, ring, and pinky fingers",
            "Point your index finger straight up",
            "The circle formed should be clear"
        ],
        "E": [
            "Curl all fingers down toward your palm",
            "Tuck your thumb in front of your fingers",
            "Hand should look like a loose fist"
        ],
        "F": [
            "Touch thumb and index finger to form a circle",
            "Extend other three fingers up",
            "Keep the circle tight and clear"
        ],
        "G": [
            "Point index finger to the side",
            "Thumb should be parallel above it",
            "Other fingers curled in"
        ],
        "H": [
            "Extend index and middle fingers horizontally",
            "Keep them together pointing sideways",
            "Thumb holds down other fingers"
        ],
        "I": [
            "Extend only your pinky finger up",
            "Keep all other fingers in a fist",
            "Pinky should be straight"
        ],
        "J": [
            "Start with 'I' handshape (pinky up)",
            "Draw a 'J' shape in the air",
            "Movement is part of this sign"
        ],
        "K": [
            "Index and middle finger up in V shape",
            "Thumb touches middle finger",
            "Palm faces forward"
        ],
        "L": [
            "Extend thumb and index finger",
            "Form an 'L' shape",
            "Other fingers folded down"
        ],
        "M": [
            "Tuck thumb under first three fingers",
            "Fingers rest on top of thumb",
            "Palm faces down"
        ],
        "N": [
            "Tuck thumb under first two fingers",
            "Similar to M but with two fingers",
            "Palm faces down"
        ],
        "O": [
            "Form a circle with all fingers and thumb",
            "Tips of fingers touch thumb tip",
            "Shape looks like the letter O"
        ],
        "P": [
            "Like K but pointing downward",
            "Middle finger points down",
            "Index finger points forward"
        ],
        "Q": [
            "Like G but pointing downward",
            "Thumb and index point down",
            "Other fingers curled"
        ],
        "R": [
            "Cross index and middle fingers",
            "Other fingers folded",
            "Thumb holds ring and pinky"
        ],
        "S": [
            "Make a fist with thumb over fingers",
            "Thumb wraps in front",
            "Different from A where thumb is on side"
        ],
        "T": [
            "Tuck thumb between index and middle fingers",
            "Make a fist around it",
            "Thumb tip peeks out"
        ],
        "U": [
            "Extend index and middle fingers up together",
            "Keep them touching",
            "Other fingers folded with thumb"
        ],
        "V": [
            "Extend index and middle fingers in V shape",
            "Spread them apart",
            "Like a peace sign"
        ],
        "W": [
            "Extend index, middle, and ring fingers",
            "Spread them apart",
            "Thumb holds pinky down"
        ],
        "X": [
            "Bend index finger like a hook",
            "Other fingers in fist",
            "Index finger curved"
        ],
        "Y": [
            "Extend thumb and pinky out",
            "Other fingers folded",
            "Like a 'hang loose' sign"
        ],
        "Z": [
            "Draw a Z shape in the air",
            "Use your index finger",
            "Movement is part of this sign"
        ]
    }
    
    letter = sign_letter.upper()
    tips = tips_database.get(letter, [
        "Keep your hand clearly visible",
        "Use good lighting",
        "Hold the sign steady",
        "Make sure background is not cluttered"
    ])
    
    return {
        "sign": letter,
        "tips": tips,
        "generalTips": [
            "Practice in good lighting",
            "Keep a plain background",
            "Hold signs steady for better recognition",
            "Position hand in center of camera"
        ]
    }

@router.get("/debug")
async def debug_info():
    """Get debug information about the model"""
    return {
        "modelLoaded": ml_manager.model is not None,
        "modelPath": str(settings.MODEL_PATH),
        "encoderPath": str(settings.LABEL_ENCODER_PATH),
        "mappingPath": str(settings.CLASS_MAPPING_PATH),
        "classes": ml_manager.classes,
        "classMapping": ml_manager.class_mapping,
        "mediapipeReady": ml_manager.hands is not None
    }
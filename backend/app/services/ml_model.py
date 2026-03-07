import cv2
import numpy as np
import tensorflow as tf
import pickle
import mediapipe as mp
import base64
from collections import deque
import os

class ISLDetector:
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialize()
        return cls._instance
    
    def _initialize(self):
        """Initialize the ML model and MediaPipe"""
        print("🔄 Loading ISL Model...")
        
        # Update these paths to match your setup
        MODEL_PATH = "C:/Users/hp/OneDrive/Desktop/ISL/ISL PLAT/models/isl_model"
        ENCODER_PATH = "C:/Users/hp/OneDrive/Desktop/ISL/ISL PLAT/models/label_encoder.pkl"
        
        # Alternative paths (if model is in different location)
        if not os.path.exists(MODEL_PATH):
            MODEL_PATH = os.path.join(os.path.dirname(__file__), "../../ml_training/models/isl_model")
        if not os.path.exists(ENCODER_PATH):
            ENCODER_PATH = os.path.join(os.path.dirname(__file__), "../../ml_training/models/label_encoder.pkl")
        
        try:
            # Load TensorFlow model
            self.model = tf.keras.models.load_model(MODEL_PATH)
            print(f"✅ Model loaded from: {MODEL_PATH}")
            
            # Load label encoder
            with open(ENCODER_PATH, "rb") as f:
                self.label_encoder = pickle.load(f)
            print(f"✅ Label encoder loaded from: {ENCODER_PATH}")
            
            # Get class labels
            self.classes = list(self.label_encoder.classes_)
            print(f"📝 Classes: {self.classes}")
            
        except Exception as e:
            print(f"❌ Error loading model: {e}")
            self.model = None
            self.label_encoder = None
            self.classes = list("ABCDEFGHIJKLMNOPQRSTUVWXYZ")
        
        # Initialize MediaPipe Hands
        self.mp_hands = mp.solutions.hands
        self.hands = self.mp_hands.Hands(
            static_image_mode=True,
            max_num_hands=2,
            min_detection_confidence=0.5,
            min_tracking_confidence=0.5
        )
        
        # Prediction queue for stability
        self.pred_queue = deque(maxlen=5)
        
        print("✅ ISL Detector initialized!")
    
    def decode_base64_image(self, image_base64: str) -> np.ndarray:
        """Decode base64 image to numpy array"""
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
    
    def extract_landmarks(self, image: np.ndarray) -> np.ndarray:
        """Extract hand landmarks from image"""
        # Convert BGR to RGB
        rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        
        # Process with MediaPipe
        results = self.hands.process(rgb)
        
        if not results.multi_hand_landmarks:
            return None
        
        # Collect hands data
        hands_data = []
        for hand_lm in results.multi_hand_landmarks:
            x_coords = [lm.x for lm in hand_lm.landmark]
            avg_x = np.mean(x_coords)
            hands_data.append((avg_x, hand_lm))
        
        # Sort left to right
        hands_data.sort(key=lambda x: x[0])
        
        # Extract landmarks
        landmarks = []
        for _, hand_lm in hands_data:
            for lm in hand_lm.landmark:
                landmarks.extend([lm.x, lm.y, lm.z])
        
        # Pad if only one hand (need 126 features for two hands)
        if len(hands_data) == 1:
            landmarks.extend([0.0] * 63)
        
        # Ensure exactly 126 features
        landmarks = np.array(landmarks[:126], dtype=np.float32)
        
        return landmarks
    
    def normalize_landmarks(self, landmarks: np.ndarray) -> np.ndarray:
        """Normalize landmarks using palm normalization"""
        # Reshape to (42, 3) - 42 landmarks with x, y, z
        landmarks = landmarks.reshape(42, 3)
        
        # Translate so wrist is at origin
        wrist = landmarks[0].copy()
        landmarks -= wrist
        
        # Scale by palm size
        palm_size = np.linalg.norm(landmarks[9])
        if palm_size > 0:
            landmarks /= palm_size
        
        # Flatten back
        return landmarks.flatten().reshape(1, -1)
    
    def predict(self, image_base64: str, expected_letter: str = None) -> dict:
        """
        Predict ISL sign from base64 image
        
        Args:
            image_base64: Base64 encoded image
            expected_letter: Expected letter for comparison
            
        Returns:
            dict with prediction results
        """
        # Check if model is loaded
        if self.model is None:
            return {
                "success": False,
                "error": "ML Model not loaded",
                "predicted": None,
                "confidence": 0
            }
        
        # Decode image
        image = self.decode_base64_image(image_base64)
        if image is None:
            return {
                "success": False,
                "error": "Failed to decode image",
                "predicted": None,
                "confidence": 0
            }
        
        # Extract landmarks
        landmarks = self.extract_landmarks(image)
        if landmarks is None:
            return {
                "success": False,
                "error": "No hand detected in image",
                "predicted": None,
                "confidence": 0,
                "handDetected": False
            }
        
        # Normalize landmarks
        normalized = self.normalize_landmarks(landmarks)
        
        # Make prediction
        try:
            prediction = self.model.predict(normalized, verbose=0)
            confidence = float(np.max(prediction))
            class_id = int(np.argmax(prediction))
            
            # Get predicted letter
            predicted_letter = self.label_encoder.inverse_transform([class_id])[0]
            
            # Determine if correct
            is_correct = False
            if expected_letter:
                is_correct = predicted_letter.upper() == expected_letter.upper()
            
            return {
                "success": True,
                "predicted": predicted_letter,
                "confidence": round(confidence * 100, 2),
                "isCorrect": is_correct,
                "expected": expected_letter,
                "handDetected": True,
                "allPredictions": {
                    self.classes[i]: round(float(prediction[0][i]) * 100, 2) 
                    for i in range(len(self.classes))
                }
            }
            
        except Exception as e:
            print(f"Prediction error: {e}")
            return {
                "success": False,
                "error": str(e),
                "predicted": None,
                "confidence": 0
            }
    
    def get_model_info(self) -> dict:
        """Get information about the loaded model"""
        return {
            "modelLoaded": self.model is not None,
            "classes": self.classes,
            "numClasses": len(self.classes)
        }

# Create singleton instance
detector = ISLDetector()
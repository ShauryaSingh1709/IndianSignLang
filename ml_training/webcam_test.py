import cv2
import numpy as np
import tensorflow as tf
import pickle
import mediapipe as mp
from collections import deque

# ==============================
# Load Model
# ==============================
model = tf.keras.models.load_model("C:/Users/hp/OneDrive/Desktop/ISL/ISL PLAT/models/isl_model")

with open("C:/Users/hp/OneDrive/Desktop/ISL/ISL PLAT/models/label_encoder.pkl", "rb") as f:
    label_encoder = pickle.load(f)

# ==============================
# Mediapipe Setup
# ==============================
mp_hands = mp.solutions.hands
mp_draw = mp.solutions.drawing_utils

hands = mp_hands.Hands(
    static_image_mode=False,
    max_num_hands=2,
    min_detection_confidence=0.7,
    min_tracking_confidence=0.7
)

cap = cv2.VideoCapture(0)

pred_queue = deque(maxlen=15)

print("🚀 Webcam started... Press Q to exit")

while True:
    ret, frame = cap.read()
    if not ret:
        break

    frame = cv2.flip(frame, 1)
    rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    results = hands.process(rgb)

    label_text = "No Hand"

    if results.multi_hand_landmarks:

        hands_data = []

        for hand_lm in results.multi_hand_landmarks:
            x_coords = [lm.x for lm in hand_lm.landmark]
            avg_x = np.mean(x_coords)
            hands_data.append((avg_x, hand_lm))

        hands_data.sort(key=lambda x: x[0])  # left to right

        landmarks = []

        for _, hand_lm in hands_data:

            mp_draw.draw_landmarks(
                frame,
                hand_lm,
                mp_hands.HAND_CONNECTIONS,
                mp_draw.DrawingSpec(color=(0,255,0), thickness=2, circle_radius=3),
                mp_draw.DrawingSpec(color=(0,0,255), thickness=2)
            )

            for lm in hand_lm.landmark:
                landmarks.extend([lm.x, lm.y, lm.z])

        if len(hands_data) == 1:
            landmarks.extend([0.0]*63)

        landmarks = np.array(landmarks[:126], dtype=np.float32)

        # ===== Palm Normalization =====
        landmarks = landmarks.reshape(42, 3)

        wrist = landmarks[0].copy()
        landmarks -= wrist

        palm_size = np.linalg.norm(landmarks[9])
        if palm_size > 0:
            landmarks /= palm_size

        landmarks = landmarks.flatten().reshape(1, -1)

        # ===== Prediction =====
        prediction = model.predict(landmarks, verbose=0)
        confidence = np.max(prediction)
        class_id = np.argmax(prediction)

        if confidence > 0.75:
            pred_queue.append(class_id)

            if len(pred_queue) == 15:
                final_id = max(set(pred_queue), key=pred_queue.count)
                label_text = label_encoder.inverse_transform([final_id])[0]
        else:
            label_text = "..."

        cv2.putText(frame, f"Conf: {confidence:.2f}",
                    (20, 80),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.7, (0,255,255), 2)

    cv2.putText(frame, label_text,
                (20, 50),
                cv2.FONT_HERSHEY_SIMPLEX,
                1, (0,255,0), 2)

    cv2.imshow("ISL Webcam Test", frame)

    if cv2.waitKey(1) & 0xFF == ord("q"):
        break

cap.release()
cv2.destroyAllWindows()
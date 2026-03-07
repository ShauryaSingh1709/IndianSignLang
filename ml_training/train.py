import os
import numpy as np
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.callbacks import (
    ModelCheckpoint,
    EarlyStopping,
    ReduceLROnPlateau,
    TensorBoard
)

import mediapipe as mp
import cv2
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.utils.class_weight import compute_class_weight
from sklearn.metrics import confusion_matrix
import pickle
import json
from pathlib import Path
from tqdm import tqdm
import matplotlib.pyplot as plt
import seaborn as sns


# ============================================
# CONFIG
# ============================================
class Config:
    DATASET_PATH    = "./dataset"
    MODEL_SAVE_PATH = "./models"
    BATCH_SIZE      = 32
    EPOCHS          = 100
    LEARNING_RATE   = 0.0005

    ISL_CLASSES = [
        'A','B','C','D','E','F','G','H','I','J',
        'K','L','M','N','O','P','Q','R','S','T',
        'U','V','W','X','Y','Z',
        'hello','thank_you','please','sorry','yes','no',
        'help','water','food','good','bad','love',
        'family','friend','school','work','home'
    ]

config = Config()


# ============================================
# DATA PROCESSOR
# ============================================
class ISLDataProcessor:
    def __init__(self):
        self.mp_hands = mp.solutions.hands
        self.hands = self.mp_hands.Hands(
            static_image_mode=True,
            max_num_hands=2,
            min_detection_confidence=0.5
        )

    def extract_landmarks(self, image_path):
        image = cv2.imread(str(image_path))
        if image is None:
            return None

        image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        results = self.hands.process(image_rgb)

        if not results.multi_hand_landmarks:
            return None

        # 🔥 FIX: Hand sorting (left → right)
        hands_data = []
        for hand_lm in results.multi_hand_landmarks:
            x_coords = [lm.x for lm in hand_lm.landmark]
            avg_x = np.mean(x_coords)
            hands_data.append((avg_x, hand_lm))

        hands_data.sort(key=lambda x: x[0])

        landmarks = []
        for _, hand_lm in hands_data:
            for lm in hand_lm.landmark:
                landmarks.extend([lm.x, lm.y, lm.z])

        # pad if single hand
        if len(hands_data) == 1:
            landmarks.extend([0.0] * 63)

        return np.array(landmarks[:126], dtype=np.float32)

    # 🔥 STRONG PALM NORMALIZATION
    def normalize_landmarks(self, landmarks):
        if landmarks is None:
            return None

        landmarks = landmarks.reshape(42, 3)

        # Wrist origin
        wrist = landmarks[0].copy()
        landmarks -= wrist

        # Palm size scaling (distance wrist → middle MCP)
        palm_size = np.linalg.norm(landmarks[9])
        if palm_size > 0:
            landmarks /= palm_size

        return landmarks.flatten()

    def process_dataset(self):
        print("🔄 Processing dataset...")
        X, y = [], []
        dataset_path = Path(config.DATASET_PATH)
        label_encoder = LabelEncoder()

        for class_folder in tqdm(sorted(dataset_path.iterdir())):
            if not class_folder.is_dir():
                continue

            class_name = class_folder.name
            if class_name not in config.ISL_CLASSES:
                continue

            images = list(class_folder.glob("*.jpg")) + \
                     list(class_folder.glob("*.png")) + \
                     list(class_folder.glob("*.jpeg"))

            for image_file in images:
                lm = self.extract_landmarks(image_file)
                normalized = self.normalize_landmarks(lm)

                if normalized is not None:
                    X.append(normalized)
                    y.append(class_name)

        if len(X) == 0:
            raise ValueError("❌ No valid images found!")

        X = np.array(X, dtype=np.float32)
        y_encoded = label_encoder.fit_transform(y)

        # 🔥 Slight augmentation
        aug_X = []
        aug_y = []
        for i in range(len(X)):
            noise = np.random.normal(0, 0.01, X[i].shape)
            aug_X.append(X[i] + noise)
            aug_y.append(y_encoded[i])

        X = np.concatenate([X, np.array(aug_X)])
        y_encoded = np.concatenate([y_encoded, np.array(aug_y)])

        print(f"✅ Dataset ready → {len(X)} samples | {len(label_encoder.classes_)} classes")

        os.makedirs(config.MODEL_SAVE_PATH, exist_ok=True)

        with open(f"{config.MODEL_SAVE_PATH}/label_encoder.pkl", 'wb') as f:
            pickle.dump(label_encoder, f)

        return X, y_encoded, label_encoder


# ============================================
# MODEL BUILDER
# ============================================
class ISLModel:
    def __init__(self, num_classes, input_dim=126):
        self.num_classes = num_classes
        self.input_dim = input_dim

    def build_dense_model(self):
        inputs = keras.Input(shape=(self.input_dim,))

        x = layers.Dense(512, activation='relu')(inputs)
        x = layers.BatchNormalization()(x)
        x = layers.Dropout(0.4)(x)

        x = layers.Dense(256, activation='relu')(x)
        x = layers.BatchNormalization()(x)
        x = layers.Dropout(0.3)(x)

        x = layers.Dense(128, activation='relu')(x)
        x = layers.Dropout(0.2)(x)

        outputs = layers.Dense(self.num_classes, activation='softmax')(x)

        return keras.Model(inputs, outputs)


# ============================================
# TRAINER
# ============================================
class Trainer:
    def __init__(self):
        self.processor = ISLDataProcessor()

    def train(self):
        X, y, label_encoder = self.processor.process_dataset()
        num_classes = len(label_encoder.classes_)

        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.1, random_state=42, stratify=y
        )

        y_train_cat = keras.utils.to_categorical(y_train, num_classes)
        y_test_cat  = keras.utils.to_categorical(y_test, num_classes)

        model = ISLModel(num_classes).build_dense_model()

        model.compile(
            optimizer=Adam(learning_rate=config.LEARNING_RATE),
            loss='categorical_crossentropy',
            metrics=['accuracy']
        )

        print("\n🚀 Training Dense Model...\n")

        history = model.fit(
            X_train, y_train_cat,
            validation_split=0.1,
            epochs=config.EPOCHS,
            batch_size=config.BATCH_SIZE,
            verbose=1
        )

        results = model.evaluate(X_test, y_test_cat)
        print(f"\n✅ Test Accuracy: {results[1]*100:.2f}%")

        model.save(f"{config.MODEL_SAVE_PATH}/isl_model")

        return model, history


# ============================================
# MAIN
# ============================================
if __name__ == "__main__":
    print("=" * 50)
    print("  ISL Sign Language - Model Training")
    print("=" * 50)

    trainer = Trainer()
    model, history = trainer.train()

    print("\n🎉 Training complete!")
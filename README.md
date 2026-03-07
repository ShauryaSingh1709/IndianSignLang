# 🤟 ISL Learning Platform

<div align="center">

![ISL Platform](https://img.shields.io/badge/ISL-Learning%20Platform-blue?style=for-the-badge&logo=hand)
![Version](https://img.shields.io/badge/version-2.0.0-green?style=for-the-badge)
![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white)
![React](https://img.shields.io/badge/React-18.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![FastAPI](https://img.shields.io/badge/FastAPI-0.104-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![TensorFlow](https://img.shields.io/badge/TensorFlow-2.15-FF6F00?style=for-the-badge&logo=tensorflow&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-purple?style=for-the-badge)

**An AI-powered platform for learning Indian Sign Language (ISL) with real-time hand gesture recognition.**

[Features](#-features) • [Tech Stack](#-tech-stack) • [Architecture](#-architecture) • [Getting Started](#-getting-started) • [API Reference](#-api-reference)

</div>

---

## 📖 Overview

The **ISL Learning Platform** is a full-stack web application that bridges the communication gap by making Indian Sign Language accessible to everyone. It combines computer vision, deep learning, and gamified learning to provide an interactive and engaging ISL learning experience.

Users can learn ISL alphabets and gestures through structured lessons, practice with real-time webcam-based gesture recognition powered by **MediaPipe** and **TensorFlow**, and track their progress through a gamified system with XP, streaks, and achievements.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🤖 **Real-Time Prediction** | Live hand gesture recognition using webcam with MediaPipe landmark detection |
| 📚 **Structured Lessons** | Curated lessons covering ISL alphabets and common gestures |
| 📊 **Progress Tracking** | Detailed learning analytics with XP points, streaks, and level progression |
| 🏆 **Gamification** | Achievement system, daily streaks, and leaderboards to keep learners motivated |
| 🔐 **Authentication** | Secure JWT-based user authentication and authorization |
| 📱 **Responsive UI** | Mobile-friendly React frontend with smooth animations |
| 🐳 **Docker Support** | Full containerized deployment with Docker Compose |

---

## 🛠 Tech Stack

### Backend
- **[FastAPI](https://fastapi.tiangolo.com/)** — High-performance Python web framework
- **[SQLAlchemy](https://www.sqlalchemy.org/)** — ORM for database management (SQLite / PostgreSQL)
- **[TensorFlow 2.15](https://tensorflow.org/)** — Deep learning model for gesture classification
- **[MediaPipe](https://mediapipe.dev/)** — Real-time hand landmark detection
- **[OpenCV](https://opencv.org/)** — Image processing pipeline
- **[python-jose](https://github.com/mpdavis/python-jose)** — JWT token handling
- **[Passlib / bcrypt](https://passlib.readthedocs.io/)** — Password hashing

### Frontend
- **[React 18](https://react.dev/)** — Component-based UI library
- **[Redux Toolkit](https://redux-toolkit.js.org/)** — State management
- **[React Router v6](https://reactrouter.com/)** — Client-side routing
- **[Tailwind CSS](https://tailwindcss.com/)** — Utility-first styling
- **[Framer Motion](https://www.framer.com/motion/)** — Animations and transitions
- **[Recharts](https://recharts.org/)** — Data visualization for progress analytics
- **[MediaPipe Hands](https://google.github.io/mediapipe/solutions/hands)** — Client-side hand tracking

### Infrastructure
- **[Docker & Docker Compose](https://www.docker.com/)** — Containerization
- **[PostgreSQL](https://www.postgresql.org/)** — Production database
- **[Redis](https://redis.io/)** — Caching layer
- **[Nginx](https://nginx.org/)** — Reverse proxy

---

## 🏗 Architecture

```
ISL/
├── backend/                    # FastAPI backend
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth.py         # Authentication endpoints
│   │   │   ├── lessons.py      # Lessons CRUD endpoints
│   │   │   ├── prediction.py   # ML inference endpoints
│   │   │   └── progress.py     # Progress tracking endpoints
│   │   ├── core/
│   │   │   └── config.py       # App configuration & settings
│   │   ├── models/
│   │   │   └── database_models.py  # SQLAlchemy ORM models
│   │   ├── schemas/
│   │   │   └── progress.py     # Pydantic schemas
│   │   ├── services/
│   │   │   ├── auth_services.py    # Auth business logic
│   │   │   ├── gamification.py     # XP & achievement logic
│   │   │   └── ml_model.py         # ISL detector service
│   │   ├── database.py         # Database connection
│   │   └── main.py             # FastAPI app entry point
│   └── requirements.txt
├── frontend/                   # React frontend
│   ├── src/
│   └── package.json
├── ml_training/                # Model training scripts & saved models
├── DATASET/                    # ISL gesture image dataset
│   ├── C/                      # ~1000+ images per letter
│   ├── F/
│   ├── G/
│   └── ...
├── docker-compose.yml
└── README.md
```

### API Structure

| Module | Base Route | Description |
|--------|-----------|-------------|
| Auth | `/api/auth` | Register, login, token refresh |
| Lessons | `/api/lessons` | Fetch and manage lessons |
| Prediction | `/api/predict` | Real-time gesture prediction |
| Progress | `/api/progress` | User progress & gamification |
| Health | `/api/health` | Service health check |

---

## 🚀 Getting Started

### Prerequisites

- **Python** 3.10+
- **Node.js** 18+
- **Docker** & **Docker Compose** (optional, for containerized setup)

---

### 🐳 Option 1: Docker (Recommended)

```bash
# Clone the repository
git clone https://github.com/your-username/isl-learning-platform.git
cd isl-learning-platform/ISL

# Start all services
docker-compose up --build
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| API Docs (Swagger) | http://localhost:8000/api/docs |
| API Docs (ReDoc) | http://localhost:8000/api/redoc |

---

### 🔧 Option 2: Manual Setup

#### 1. Backend Setup

```bash
cd ISL/backend

# Create and activate virtual environment
python -m venv venv
# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
# Edit .env with your settings

# Start the backend server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

#### 2. Frontend Setup

```bash
cd ISL/frontend

# Install dependencies
npm install

# Start development server
npm start
```

#### 3. Environment Variables

Create `ISL/backend/.env`:

```env
SECRET_KEY=your-super-secret-key-change-in-production
DATABASE_URL=sqlite:///./isl.db
MODEL_PATH=../ml_training/models/isl_model
LABEL_ENCODER_PATH=../ml_training/models/label_encoder.pkl
```

---

## 🤖 ML Model

The gesture recognition pipeline works as follows:

1. **Video Capture** — Webcam frames are captured in the React frontend or sent as base64 to the API
2. **Hand Detection** — MediaPipe Hands detects 21 hand landmarks per frame
3. **Feature Extraction** — Landmark coordinates are normalized and flattened into a feature vector
4. **Classification** — A TensorFlow Keras model classifies the gesture into an ISL letter/sign
5. **Result** — Prediction with confidence score is returned in real-time

### Dataset

The `DATASET/` directory contains labeled hand gesture images organized per ISL character (e.g., `C/`, `F/`, `G/`, ...), with 100–1000+ images per class used to train the recognition model.

---

## 📡 API Reference

Interactive API documentation is automatically available when the backend is running:

- **Swagger UI**: [`/api/docs`](http://localhost:8000/api/docs)
- **ReDoc**: [`/api/redoc`](http://localhost:8000/api/redoc)

### Key Endpoints

```http
POST   /api/auth/register       Register a new user
POST   /api/auth/login          Login and receive JWT token
GET    /api/lessons             Get all lessons
GET    /api/lessons/{id}        Get lesson by ID
POST   /api/predict/image       Predict ISL gesture from base64 image
GET    /api/progress            Get user learning progress
POST   /api/progress/complete   Mark a lesson as completed
GET    /api/health              Service health check
```

---

## 🎮 Gamification System

The platform motivates learners through:

- **⭐ XP Points** — Earned by completing lessons and correct predictions
- **🔥 Daily Streaks** — Consecutive days of practice
- **🏅 Achievements** — Unlockable badges for milestones
- **📈 Level Progression** — Advance through levels as XP accumulates
- **📊 Analytics Dashboard** — Visual charts of learning progress over time

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'feat: add some feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

Made with ❤️ to make Indian Sign Language accessible to all.

</div>

<div align="center">

# ISL Learning Platform

### Breaking Barriers, One Sign at a Time

![ISL Platform](https://img.shields.io/badge/ISL-Learning%20Platform-6C63FF?style=for-the-badge)
![Version](https://img.shields.io/badge/version-2.0.0-22C55E?style=for-the-badge)
![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white)
![React](https://img.shields.io/badge/React-18.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![FastAPI](https://img.shields.io/badge/FastAPI-0.104-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![TensorFlow](https://img.shields.io/badge/TensorFlow-2.15-FF6F00?style=for-the-badge&logo=tensorflow&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-A855F7?style=for-the-badge)

<br/>

> **Hackathon Project — Team Sudarshan**
>
> An AI-powered full-stack platform that makes Indian Sign Language (ISL) accessible to everyone through real-time gesture recognition, structured lessons, and gamified learning.

<br/>

[Features](#features) &nbsp;|&nbsp; [Tech Stack](#tech-stack) &nbsp;|&nbsp; [Architecture](#architecture) &nbsp;|&nbsp; [Getting Started](#getting-started) &nbsp;|&nbsp; [API Reference](#api-reference) &nbsp;|&nbsp; [Team](#team)

</div>

---

## Why ISL Learning Platform?

Over 63 million people in India have significant hearing loss, yet Indian Sign Language remains largely inaccessible to the general population. This platform addresses that gap by combining cutting-edge AI with an engaging learning experience — making ISL education available to anyone with a webcam and a browser.

---

## Features

**Real-Time AI Prediction**
Live hand gesture recognition using your webcam. MediaPipe detects 21 hand landmarks per frame, which are fed into a TensorFlow model for instant ISL classification with confidence scores.

**Structured Lessons**
Curated, progressive lessons covering ISL alphabets and common gestures — designed for complete beginners through to advanced learners.

**Gamification Engine**
Stay motivated with XP points, daily streaks, achievement badges, and level progression. Learning ISL has never been this engaging.

**Progress Analytics**
Visual dashboards powered by Recharts show your learning journey — accuracy trends, lesson completion rates, and streak history.

**Secure Authentication**
JWT-based authentication with bcrypt password hashing ensures your data stays safe and sessions remain secure.

**Production Ready**
Fully containerized with Docker Compose — includes PostgreSQL, Redis, Nginx reverse proxy, and support for scaling.

---

## Tech Stack

### Backend

| Technology | Version | Purpose |
|---|---|---|
| FastAPI | 0.104.1 | High-performance REST API framework |
| TensorFlow | 2.15.0 | Deep learning gesture classification |
| MediaPipe | 0.10.9 | Real-time hand landmark detection |
| OpenCV | 4.8.1 | Image processing pipeline |
| SQLAlchemy | 2.0.23 | ORM for database management |
| python-jose | 3.3.0 | JWT token authentication |
| Passlib / bcrypt | 1.7.4 | Secure password hashing |

### Frontend

| Technology | Version | Purpose |
|---|---|---|
| React | 18.2 | Component-based UI library |
| Redux Toolkit | 2.0.1 | Global state management |
| Tailwind CSS | 3.3.6 | Utility-first styling |
| Framer Motion | 10.16.5 | Smooth animations and transitions |
| Recharts | 2.10.1 | Progress data visualization |
| MediaPipe Hands | 0.4 | Client-side hand tracking |

### Infrastructure

| Technology | Purpose |
|---|---|
| Docker and Docker Compose | Containerization and orchestration |
| PostgreSQL 15 | Production-grade relational database |
| Redis 7 | Caching and session management |
| Nginx | Reverse proxy and SSL termination |

---

## Architecture

```
ISL/
├── backend/                        # FastAPI Python backend
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth.py             # Authentication endpoints
│   │   │   ├── lessons.py          # Lessons CRUD
│   │   │   ├── prediction.py       # ML inference (real-time)
│   │   │   └── progress.py         # Progress and gamification
│   │   ├── core/config.py          # App configuration
│   │   ├── models/                 # SQLAlchemy ORM models
│   │   ├── schemas/                # Pydantic validation schemas
│   │   ├── services/
│   │   │   ├── auth_services.py    # Auth business logic
│   │   │   ├── gamification.py     # XP, streaks, achievements
│   │   │   └── ml_model.py         # ISL detector singleton
│   │   └── main.py                 # FastAPI entry point
│   └── requirements.txt
│
├── frontend/                       # React 18 frontend
│   ├── src/
│   └── package.json
│
├── ml_training/                    # Model training scripts and saved models
│
├── DATASET/                        # ISL gesture image dataset
│   ├── C/   (1000+ images)
│   ├── F/   (1000+ images)
│   ├── G/   (1000+ images)
│   └── ...  (all ISL alphabets)
│
├── docker-compose.yml
└── README.md
```

### API Endpoints Overview

| Module | Base Route | Description |
|--------|-----------|-------------|
| Auth | `/api/auth` | Register, login, JWT token management |
| Lessons | `/api/lessons` | Fetch and manage ISL lessons |
| Prediction | `/api/predict` | Real-time gesture prediction via ML |
| Progress | `/api/progress` | User progress, XP and achievements |
| Health | `/api/health` | Service health check |

---

## ML Pipeline

```
Webcam Frame
      |
      v
MediaPipe Hands
(21 landmarks detected per frame)
      |
      v
Feature Extraction
(Normalize and flatten coordinates into a 63-dimensional vector)
      |
      v
TensorFlow Keras Model
(Multi-class classification)
      |
      v
ISL Letter + Confidence Score
```

The model was trained on a custom dataset of 1000+ images per ISL character, achieving high accuracy across all supported alphabets.

---

## Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+
- Docker and Docker Compose (for containerized setup)

---

### Option 1: Docker (Recommended)

```bash
# Clone the repository
git clone https://github.com/ShauryaSingh1709/IndianSignLang.git
cd IndianSignLang/ISL

# Start all services (backend, frontend, database, Redis, Nginx)
docker-compose up --build
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| Swagger Docs | http://localhost:8000/api/docs |
| ReDoc | http://localhost:8000/api/redoc |

---

### Option 2: Manual Setup

#### Backend

```bash
cd ISL/backend

# Create and activate virtual environment
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env

# Start the server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

#### Frontend

```bash
cd ISL/frontend
npm install
npm start
```

#### Environment Variables (`backend/.env`)

```env
SECRET_KEY=your-super-secret-key-change-in-production
DATABASE_URL=sqlite:///./isl.db
MODEL_PATH=../ml_training/models/isl_model
LABEL_ENCODER_PATH=../ml_training/models/label_encoder.pkl
```

---

## API Reference

Full interactive documentation is available when the backend is running:

- Swagger UI: http://localhost:8000/api/docs
- ReDoc: http://localhost:8000/api/redoc

```http
POST   /api/auth/register        Register a new user
POST   /api/auth/login           Login and receive JWT token
GET    /api/lessons              Get all available lessons
GET    /api/lessons/{id}         Get lesson by ID
POST   /api/predict/image        Predict ISL gesture from base64 image
GET    /api/progress             Get authenticated user's progress
POST   /api/progress/complete    Mark a lesson as completed
GET    /api/health               Service health check
```

---

## Gamification System

| Element | Description |
|---------|-------------|
| XP Points | Earned by completing lessons and making correct predictions |
| Daily Streaks | Consecutive days of active practice |
| Achievements | Unlockable badges for reaching milestones |
| Level System | Advance through levels as XP accumulates |
| Analytics | Visual charts of accuracy, completion rate, and streaks |

---

## Team

<div align="center">

### Team Sudarshan — Hackathon Project

| Contributor | GitHub |
|---|---|
| Shaurya Singh | [@ShauryaSingh1709](https://github.com/ShauryaSingh1709) | 
| Adi Bariya | [@AdiBariya](https://github.com/AdiBariya) |

*Built with dedication by Team Sudarshan.*

</div>

---

## Contributing

Contributions are welcome. Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'feat: add some feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

<div align="center">

If this project helped you, please consider giving it a star.

Made with dedication by Team Sudarshan — making Indian Sign Language accessible to all.

</div>

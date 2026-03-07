from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
import uvicorn

from app.api import auth, lessons, progress, prediction
from app.database import engine, Base

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="ISL Learning Platform API",
    description="Indian Sign Language Learning Platform with ML Prediction",
    version="2.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

# CORS configuration - Allow all origins for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Compression middleware
app.add_middleware(GZipMiddleware, minimum_size=1000)

# API Routers with prefixes
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(lessons.router, prefix="/api/lessons", tags=["Lessons"])
app.include_router(progress.router, prefix="/api/progress", tags=["Progress"])
app.include_router(prediction.router, prefix="/api/predict", tags=["ML Prediction"])

# Health check endpoint
@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "version": "2.0.0",
        "endpoints": {
            "auth": "/api/auth",
            "lessons": "/api/lessons",
            "progress": "/api/progress",
            "predict": "/api/predict"
        }
    }

# Root endpoint
@app.get("/")
async def root():
    return {
        "message": "ISL Learning Platform API",
        "docs": "/api/docs",
        "health": "/api/health"
    }

# Run server
if __name__ == "__main__":
    print("🚀 Starting ISL Backend Server...")
    print("📍 API Docs: http://localhost:8000/api/docs")
    print("📍 Health Check: http://localhost:8000/api/health")
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
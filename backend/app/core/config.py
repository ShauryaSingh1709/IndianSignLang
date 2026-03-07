from pathlib import Path
from pydantic_settings import BaseSettings

BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent

class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "sqlite:///./isl.db"
    REDIS_URL: str = "redis://localhost:6379"
    
    # JWT
    SECRET_KEY: str = "your-super-secret-key-change-this-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # ML Model paths
    MODEL_PATH: Path = BASE_DIR / "models" / "isl_model"
    LABEL_ENCODER_PATH: Path = BASE_DIR / "models" / "label_encoder.pkl"
    CLASS_MAPPING_PATH: Path = BASE_DIR / "models" / "class_mapping.json"
    
    # App
    APP_NAME: str = "ISL Learning Platform"
    DEBUG: bool = True

    class Config:
        env_file = ".env"

settings = Settings()
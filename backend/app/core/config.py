import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "CardioTwin AI"
    API_V1_STR: str = "/api/v1"
    
    # Model and Data paths
    MODEL_PATH: str = os.getenv("MODEL_PATH", "../model/cardiotwin_bayesian_model.pkl")
    DATA_PATH: str = os.getenv("DATA_PATH", "../model/heart_cleaned.csv")
    DATA_BN_PATH: str = os.getenv("DATA_BN_PATH", "../model/heart_bn_ready.csv")
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()

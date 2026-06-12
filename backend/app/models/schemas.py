# pyrefly: ignore [missing-import]
from pydantic import BaseModel, Field
from typing import List, Dict, Optional

class AssessmentInput(BaseModel):
    age: float = Field(..., description="Age of patient in years", ge=20, le=100)
    sex: int = Field(..., description="Gender: 1=Male, 0=Female", ge=0, le=1)
    cp: int = Field(..., description="Chest Pain Type (0-3)", ge=0, le=3)
    trestbps: float = Field(..., description="Resting Blood Pressure in mm Hg", ge=80, le=220)
    chol: float = Field(..., description="Serum Cholesterol in mg/dl", ge=100, le=600)
    fbs: int = Field(..., description="Fasting Blood Sugar > 120 mg/dl (1=True, 0=False)", ge=0, le=1)
    restecg: int = Field(..., description="Resting ECG Results (0-2)", ge=0, le=2)
    thalach: float = Field(..., description="Maximum Heart Rate Achieved", ge=60, le=220)
    exang: int = Field(..., description="Exercise-Induced Angina (1=Yes, 0=No)", ge=0, le=1)
    oldpeak: float = Field(..., description="ST Depression induced by exercise relative to rest", ge=0.0, le=8.0)
    slope: int = Field(..., description="Slope of Peak Exercise ST Segment (0-2)", ge=0, le=2)
    ca: int = Field(..., description="Number of Major Vessels colored by fluoroscopy (0-4)", ge=0, le=4)
    thal: int = Field(..., description="Thalassemia Status (0-3)", ge=0, le=3)

class AssessmentResult(BaseModel):
    bayesianRiskProb: float = Field(..., description="Disease probability from Bayesian Network model")
    xgboostRiskProb: float = Field(..., description="Disease probability from benchmark XGBoost model")
    riskScore: int = Field(..., description="Integer risk score from 0-10 based on risk flags")
    riskGroup: str = Field(..., description="Risk level category (Low, Moderate, High)")
    healthScore: int = Field(..., description="Health score index from 0-100")
    recommendations: List[str] = Field(..., description="Personalized cardiac care recommendations")

class EdgeItem(BaseModel):
    source: str
    target: str

class AssessmentResponse(BaseModel):
    inputs: AssessmentInput
    discretized: Dict[str, int]
    results: AssessmentResult
    shapContributions: Dict[str, float]
    shapBaseValue: float
    bnEdges: List[EdgeItem]
    bnNodes: List[str]

class SimulatorRequest(BaseModel):
    baseInputs: AssessmentInput
    trestbps: float = Field(..., ge=80, le=220)
    chol: float = Field(..., ge=100, le=600)
    thalach: float = Field(..., ge=60, le=220)

class SimulatorResponse(BaseModel):
    currentRisk: float
    projectedRisk: float
    improvement: float

class ReportRequest(BaseModel):
    inputs: AssessmentInput
    results: AssessmentResult

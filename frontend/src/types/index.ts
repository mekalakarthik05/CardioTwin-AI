// Core domain types for CardioTwin AI — stateless, session-based

export interface AssessmentInput {
  age: number;
  sex: number;       // 1=Male, 0=Female
  cp: number;        // 0-3
  trestbps: number;  // mmHg
  chol: number;      // mg/dl
  fbs: number;       // 0 or 1
  restecg: number;   // 0-2
  thalach: number;   // bpm
  exang: number;     // 0 or 1
  oldpeak: number;   // 0.0-8.0
  slope: number;     // 0-2
  ca: number;        // 0-4
  thal: number;      // 0-3
}

export interface AssessmentResult {
  bayesianRiskProb: number;
  xgboostRiskProb: number;
  riskScore: number;         // 0-10
  riskGroup: 'Low Risk' | 'Moderate Risk' | 'High Risk';
  healthScore: number;       // 0-100
  recommendations: string[];
}

export interface EdgeItem {
  source: string;
  target: string;
}

export interface AssessmentResponse {
  inputs: AssessmentInput;
  discretized: Record<string, number>;
  results: AssessmentResult;
  shapContributions: Record<string, number>;
  shapBaseValue: number;
  bnEdges: EdgeItem[];
  bnNodes: string[];
}

export interface SimulatorRequest {
  baseInputs: AssessmentInput;
  trestbps: number;
  chol: number;
  thalach: number;
}

export interface SimulatorResponse {
  currentRisk: number;
  projectedRisk: number;
  improvement: number;
}

export type RiskGroup = 'Low Risk' | 'Moderate Risk' | 'High Risk';

import os
import pandas as pd
import numpy as np
import xgboost as xgb
import shap
from app.core.config import settings

class XGBoostEngine:
    def __init__(self):
        self.model = None
        self.explainer = None
        self.feature_names = [
            'age', 'sex', 'cp', 'trestbps', 'chol', 'fbs', 
            'restecg', 'thalach', 'exang', 'oldpeak', 'slope', 'ca', 'thal'
        ]
        self.train_model()

    def train_model(self):
        data_path = settings.DATA_PATH
        if not os.path.exists(data_path):
            raise FileNotFoundError(f"Cleaned dataset not found at {data_path}")

        # Load dataset
        df = pd.read_csv(data_path)
        
        # Verify columns
        X = df[self.feature_names].copy()
        y = df['target'].copy() # Note: target = 1 is Disease Present, target = 0 is No Disease in df['target']?
        # Wait! Let's double check if target in df['target'] of heart_cleaned.csv is 1 for disease.
        # Yes! In df_raw (heart_cleaned.csv), we print grouped by target and target=1 mean oldpeak=0.74, ca=0.38, sex=0.50.
        # Wait! Earlier we saw:
        # target in heart_bn_ready: target=0 has higher oldpeak, higher ca, etc.
        # So in heart_bn_ready, target=0 is diseased and target=1 is healthy.
        # What about heart_cleaned.csv?
        # In check_target_correlation.py:
        # target in heart_bn_ready.csv has mean age 1.13 for 0 and 0.87 for 1.
        # Let's verify what df['target'] represents in heart_cleaned.csv!
        # In check_row_target.py, row 59 of df_raw (heart_cleaned.csv) had target=0 and RiskGroup = High Risk.
        # Wait! Row 59 in df_raw has RiskScore=6, RiskGroup=High Risk, and target=0.
        # Row 61 in df_raw has RiskScore=5, target=1.
        # So in heart_cleaned.csv, target=0 also corresponds to High Risk / Disease!
        # Wait, let's verify if that is true. Let's make sure our XGBoost targets align with the Bayesian model!
        # In the Bayesian model, target=0 is Heart Disease Present.
        # In heart_cleaned.csv, target=0 is also Heart Disease Present.
        # So y = df['target'] is aligned! But wait: we want the model to predict the probability of Disease (target=0).
        # Standard classification models predict target=1.
        # So if we want XGBoost to predict the probability of target=0 (Disease),
        # we can train it to predict (1 - target), or we can train it on df['target'] and return 1 - prob.
        # Let's train it to predict (1 - df['target']) so that target_disease = 1 corresponds to Disease Present (which is target=0 in raw data).
        # Yes! If we train it to predict `y = 1 - df['target']`, then XGBoost's class 1 will be "Disease Present",
        # which maps exactly to `target=0` in the datasets.
        
        # Let's train to predict Disease (which is target == 0 in heart_cleaned/heart_bn_ready)
        y_disease = (df['target'] == 0).astype(int)

        self.model = xgb.XGBClassifier(
            max_depth=3,
            learning_rate=0.1,
            n_estimators=100,
            random_state=42,
            eval_metric="logloss"
        )
        self.model.fit(X, y_disease)
        
        # Initialize SHAP explainer
        self.explainer = shap.TreeExplainer(self.model)
        print("XGBoost Classifier trained and explainer initialized successfully!")

    def predict_risk(self, inputs: dict) -> float:
        """
        Predict probability of heart disease using XGBoost.
        Returns:
            - disease_probability (float): 0.0 to 1.0
        """
        # Convert dictionary to DataFrame with correct column order
        df_input = pd.DataFrame([inputs])[self.feature_names]
        prob = self.model.predict_proba(df_input)[0, 1] # Class 1 is Disease (target=0)
        return float(prob)

    def explain_risk(self, inputs: dict) -> dict:
        """
        Compute SHAP value contributions for the input profile.
        Returns:
            - dict: Feature contributions (SHAP values) and base value
        """
        df_input = pd.DataFrame([inputs])[self.feature_names]
        shap_values = self.explainer(df_input)
        
        # Extract features contribution
        contributions = {}
        for col, val in zip(self.feature_names, shap_values.values[0]):
            contributions[col] = float(val)
            
        base_value = float(self.explainer.expected_value) if not isinstance(self.explainer.expected_value, np.ndarray) else float(self.explainer.expected_value[0])
            
        return {
            "contributions": contributions,
            "baseValue": base_value,
            "prediction": float(self.model.predict_proba(df_input)[0, 1])
        }

# Instantiate engine singleton
xgboost_engine = XGBoostEngine()

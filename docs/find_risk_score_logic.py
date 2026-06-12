import pandas as pd
import numpy as np

df = pd.read_csv("heart_cleaned.csv")

# Let's define the features we want to test:
# We will create binary indicators for every feature based on common thresholds
features = {}
features['sex_male'] = (df['sex'] == 1).astype(int)
features['age_gt_45'] = (df['age'] >= 45).astype(int)
features['age_gt_50'] = (df['age'] >= 50).astype(int)
features['age_gt_55'] = (df['age'] >= 55).astype(int)
features['age_gt_60'] = (df['age'] >= 60).astype(int)
features['cp_typical'] = (df['cp'] == 0).astype(int)
features['cp_non_typical'] = (df['cp'] > 0).astype(int)
features['bp_gt_120'] = (df['trestbps'] >= 120).astype(int)
features['bp_gt_130'] = (df['trestbps'] >= 130).astype(int)
features['bp_gt_140'] = (df['trestbps'] >= 140).astype(int)
features['chol_gt_200'] = (df['chol'] >= 200).astype(int)
features['chol_gt_240'] = (df['chol'] >= 240).astype(int)
features['fbs_high'] = (df['fbs'] == 1).astype(int)
features['restecg_abnormal'] = (df['restecg'] > 0).astype(int)
features['thalach_lt_140'] = (df['thalach'] < 140).astype(int)
features['thalach_lt_150'] = (df['thalach'] < 150).astype(int)
features['exang_yes'] = (df['exang'] == 1).astype(int)
features['oldpeak_gt_0'] = (df['oldpeak'] > 0).astype(int)
features['oldpeak_gt_1'] = (df['oldpeak'] >= 1.0).astype(int)
features['oldpeak_gt_2'] = (df['oldpeak'] >= 2.0).astype(int)
features['slope_flat_up'] = (df['slope'] < 2).astype(int)
features['ca_gt_0'] = (df['ca'] > 0).astype(int)
features['ca_gt_1'] = (df['ca'] > 1).astype(int)
features['thal_abnormal'] = (df['thal'] != 2).astype(int) # 2 is normal, 3 is reversible, 1 is fixed
features['target_no_disease'] = (df['target'] == 0).astype(int)

df_feats = pd.DataFrame(features)
y = df['RiskScore']

# Let's run a Ridge / Lasso regression on these binary indicators to see which ones have high weights
from sklearn.linear_model import LassoCV, RidgeCV
lasso = LassoCV(cv=5).fit(df_feats, y)
print("=== Lasso Selected Features ===")
for col, coef in zip(df_feats.columns, lasso.coef_):
    if abs(coef) > 0.05:
        print(f"  {col}: {coef:.4f}")
print(f"  Intercept: {lasso.intercept_:.4f}")
print(f"  Lasso R^2: {lasso.score(df_feats, y):.4f}")

# What if we run a standard linear regression with all of them?
from sklearn.linear_model import LinearRegression
reg = LinearRegression().fit(df_feats, y)
print("\n=== Linear Regression R^2 ===")
print(f"R^2: {reg.score(df_feats, y):.4f}")

# Let's search for an integer-weighted sum that matches RiskScore perfectly
# We can do this by using a simple regression with Ridge, then rounding coefficients
# Or let's see if the RiskScore was computed using a known clinical score (like Framingham Risk Score, but modified).
# Wait, let's print the unique values of RiskScore and check if they are exactly:
# AgeGroup code + BPCategory code + CholCategory code + HRCategory code?
# Wait! In the previous script, we encoded them:
# Age_code: <40: 0, 40-54: 1, 55-64: 2, >=65: 3
# BP_code: Normal: 0, Elevated: 1, HTN Stage 1: 2, HTN Stage 2: 3
# Chol_code: Desirable: 0, Borderline High: 1, High: 2
# HR_code: Low: 0, Moderate: 1, High: 2, Very High: 3
# Wait, let's check if the sum of these codes matches RiskScore for some rows:
# For Row 0: Age_code=1, BP_code=1, Chol_code=1, HR_code=2. Sum = 5, RiskScore = 3.
# Wait, why is RiskScore = 3?
# In Row 0: target=0.
# In Row 5: AgeGroup=55-64 (2), BP=Normal (0), Chol=High (2), HR=Moderate (1). Sum = 5, RiskScore = 2.
# Wait! What if RiskScore is calculated as:
# RiskScore = (Age_code + BP_code + Chol_code + HR_code) - 2 * target?
# Let's check:
# Row 0: target=0. Sum = 5. RiskScore = 3. Mismatch (5 != 3).
# Row 5: target=1. Sum = 5. RiskScore = 2. Mismatch (Sum - 2 = 3 != 2).
# Let's write a python script to search for the coefficients of:
# RiskScore = w1 * Age_code + w2 * BP_code + w3 * Chol_code + w4 * HR_code + w5 * sex + w6 * target + ...
# using LinearRegression on the categorical codes.

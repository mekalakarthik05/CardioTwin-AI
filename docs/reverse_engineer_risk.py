import pandas as pd
import numpy as np

df = pd.read_csv("heart_cleaned.csv")

# Let's print out the first 20 rows of df with the individual features and RiskScore
cols = ['age', 'sex', 'cp', 'trestbps', 'chol', 'fbs', 'restecg', 'thalach', 'exang', 'oldpeak', 'slope', 'ca', 'thal', 'target', 'RiskScore']
print(df[cols].head(20).to_string())

# Let's check how many risk flags could be defined.
# Let's write a script to check which binary flags sum up to RiskScore.
# Let's try standard clinical flags:
# 1. age >= 55 (or maybe 50?)
# 2. sex == 1 (male)
# 3. cp == 0 (typical angina / asymptomatic chest pain? Actually chest pain cp > 0 might be protective or vice versa)
# 4. trestbps >= 130 (or HTN stage 1/2?)
# 5. chol >= 240 (high cholesterol)
# 6. fbs == 1 (fasting blood sugar)
# 7. restecg != 0?
# 8. thalach < 140?
# 9. exang == 1
# 10. oldpeak >= 1.0 (or > 0?)
# 11. slope != 2? (slope: 0, 1, 2. 2 is downsloping which is normal/better, 1 is flat, 0 is upsloping. flat/upsloping are abnormal)
# 12. ca > 0 (vessels colored)
# 13. thal == 3 (reversible defect) or thal != 2?

# Let's test combinations of indicators and see if any subset sums up exactly to RiskScore
# We will do a linear model with integer coefficients or just check if there's a simple sum.
# Let's use a decision tree or linear programming or a simple Lasso regression to see which binary variables are active.

# Let's see if we can find a subset of indicators that sums up EXACTLY to RiskScore.
# We will do a linear regression on category variables if RiskScore is a sum of scores.
# Let's write a quick solver:
print("\nChecking if RiskScore is a sum of category codes:")
# Let's encode categories as integers and see if they sum up to RiskScore:
# AgeGroup: <40, 40-54, 55-64, >=65
# BPCategory: Normal, Elevated, HTN Stage 1, HTN Stage 2
# CholCategory: Desirable, Borderline High, High
# HRCategory: Low, Moderate, High, Very High

df_encoded = pd.DataFrame()
df_encoded['Age_code'] = df['AgeGroup'].map({'<40': 0, '40-54': 1, '55-64': 2, '>=65': 3})
df_encoded['BP_code'] = df['BPCategory'].map({'Normal': 0, 'Elevated': 1, 'HTN Stage 1': 2, 'HTN Stage 2': 3})
df_encoded['Chol_code'] = df['CholCategory'].map({'Desirable': 0, 'Borderline High': 1, 'High': 2})
df_encoded['HR_code'] = df['HRCategory'].map({'Low': 0, 'Moderate': 1, 'High': 2, 'Very High': 3})

# Let's see if RiskScore is exactly the sum of these codes!
df_encoded['Sum_codes'] = df_encoded['Age_code'] + df_encoded['BP_code'] + df_encoded['Chol_code'] + df_encoded['HR_code']
df_encoded['RiskScore'] = df['RiskScore']
mismatches = df_encoded[df_encoded['Sum_codes'] != df_encoded['RiskScore']]
print(f"Number of mismatches using Sum of Codes: {len(mismatches)} / {len(df)}")
if len(mismatches) > 0:
    print("Mismatches:")
    print(df.loc[mismatches.index, ['AgeGroup', 'BPCategory', 'CholCategory', 'HRCategory', 'RiskScore']].head(10))
    print(df_encoded.loc[mismatches.index, ['Age_code', 'BP_code', 'Chol_code', 'HR_code', 'Sum_codes', 'RiskScore']].head(10))
else:
    print("PERFECT MATCH! RiskScore is indeed the sum of these codes!")


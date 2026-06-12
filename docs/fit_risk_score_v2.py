import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.tree import DecisionTreeRegressor

df = pd.read_csv("heart_cleaned.csv")

print("Missing values in raw columns:")
print(df.isnull().sum())

# Let's inspect the mapped columns
df_encoded = pd.DataFrame()
df_encoded['Age_code'] = df['AgeGroup'].map({'<40': 0, '40-54': 1, '55-64': 2, '>=65': 3})
df_encoded['BP_code'] = df['BPCategory'].map({'Normal': 0, 'Elevated': 1, 'HTN Stage 1': 2, 'HTN Stage 2': 3})
df_encoded['Chol_code'] = df['CholCategory'].map({'Desirable': 0, 'Borderline High': 1, 'High': 2})
df_encoded['HR_code'] = df['HRCategory'].map({'Low': 0, 'Moderate': 1, 'High': 2, 'Very High': 3})

print("\nMissing values in mapped columns:")
print(df_encoded.isnull().sum())

# Let's see what values are causing NaNs in mapped columns, if any:
for col in ['AgeGroup', 'BPCategory', 'CholCategory', 'HRCategory']:
    print(f"\nUnique values in {col}:")
    print(df[col].unique())

# Let's drop rows with NaNs in our analysis or fill them
# Let's find columns with NaNs in df
df_numeric = df.select_dtypes(include=[np.number]).copy()
print("\nMissing values in numeric columns:")
print(df_numeric.isnull().sum())

# Let's fit a regression using numeric columns of df
X_num = df_numeric.drop(columns=['RiskScore'])
# If there are NaNs, let's drop them
X_num['Age_code'] = df_encoded['Age_code']
X_num['BP_code'] = df_encoded['BP_code']
X_num['Chol_code'] = df_encoded['Chol_code']
X_num['HR_code'] = df_encoded['HR_code']

# Drop target if it correlates too much, wait, let's keep it to check
y = df['RiskScore']

# Align X and y by dropping NaNs
combined = pd.concat([X_num, y], axis=1).dropna()
X_clean = combined.drop(columns=['RiskScore'])
y_clean = combined['RiskScore']

reg = LinearRegression().fit(X_clean, y_clean)
print("\n=== Regression on clean data ===")
print(f"R^2 score: {reg.score(X_clean, y_clean):.4f}")
for col, coef in zip(X_clean.columns, reg.coef_):
    if abs(coef) > 0.001:
         print(f"  {col}: {coef:.4f}")
print(f"  Intercept: {reg.intercept_:.4f}")

# Let's see if we can find a subset of variables that gives R^2 = 1.0
dt = DecisionTreeRegressor(max_depth=5).fit(X_clean, y_clean)
print(f"\nDecision Tree clean R^2 score: {dt.score(X_clean, y_clean):.4f}")

# Let's print feature importances for decision tree
print("\nDecision Tree Feature Importances:")
for col, imp in zip(X_clean.columns, dt.feature_importances_):
    if imp > 0:
        print(f"  {col}: {imp:.4f}")

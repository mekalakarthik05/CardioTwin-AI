import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression, Lasso
from sklearn.tree import DecisionTreeRegressor

df = pd.read_csv("heart_cleaned.csv")

# Let's construct a wide set of indicators based on standard values and categories
X = pd.DataFrame()

# Demographic indicators
X['sex'] = df['sex']
X['age'] = df['age']

# Categorical mapping codes
X['Age_code'] = df['AgeGroup'].map({'<40': 0, '40-54': 1, '55-64': 2, '>=65': 3})
X['BP_code'] = df['BPCategory'].map({'Normal': 0, 'Elevated': 1, 'HTN Stage 1': 2, 'HTN Stage 2': 3})
X['Chol_code'] = df['CholCategory'].map({'Desirable': 0, 'Borderline High': 1, 'High': 2})
X['HR_code'] = df['HRCategory'].map({'Low': 0, 'Moderate': 1, 'High': 2, 'Very High': 3})

# Raw variables
X['trestbps'] = df['trestbps']
X['chol'] = df['chol']
X['thalach'] = df['thalach']
X['oldpeak'] = df['oldpeak']

# Discrete variables
X['cp'] = df['cp']
X['fbs'] = df['fbs']
X['restecg'] = df['restecg']
X['exang'] = df['exang']
X['slope'] = df['slope']
X['ca'] = df['ca']
X['thal'] = df['thal']
X['target'] = df['target']

# Let's fit a regression
y = df['RiskScore']
reg = LinearRegression().fit(X, y)
print("=== Regression Coefficients ===")
print(f"R^2 score: {reg.score(X, y):.4f}")
for col, coef in zip(X.columns, reg.coef_):
    if abs(coef) > 0.001:
         print(f"  {col}: {coef:.4f}")
print(f"  Intercept: {reg.intercept_:.4f}")

# Let's fit a Decision Tree Regressor to see if it can reconstruct it perfectly (R^2 = 1.0)
dt = DecisionTreeRegressor(max_depth=6).fit(X, y)
print(f"\nDecision Tree R^2 score: {dt.score(X, y):.4f}")

# Let's see if we can find which subset of variables yields R^2 = 1.0.
# Actually, could RiskScore be a simple score calculated from standard risk factors?
# Let's inspect the correlation of all columns with RiskScore again.
corrs = df.select_dtypes(include=[np.number]).corr()['RiskScore']
print("\nCorrelations:")
print(corrs.sort_values(ascending=False))

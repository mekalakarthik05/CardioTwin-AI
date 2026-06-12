import pandas as pd
import numpy as np

# Load cleaned dataset
df = pd.read_csv("heart_cleaned.csv")

print("--- Inspecting RiskScore and RiskGroup ---")
print(df[['RiskScore', 'RiskGroup', 'target']].head(10))

print("\nRiskGroup by target:")
print(pd.crosstab(df['RiskGroup'], df['target']))

print("\nRiskScore by target (mean and range):")
print(df.groupby('target')['RiskScore'].agg(['min', 'max', 'mean', 'count']))

print("\nLet's check if RiskScore is a sum of certain risk factors.")
# Let's see correlation of RiskScore with other columns
corrs = df.select_dtypes(include=[np.number]).corr()['RiskScore'].sort_values(ascending=False)
print("\nCorrelation of RiskScore with other numeric columns:")
print(corrs)

# Let's check how RiskScore can be reconstructed.
# For example, is it just count of high risk values?
# Let's print out the exact values of RiskScore and all individual features for the first 10 rows.
print("\nIndividual features and RiskScore for first 5 rows:")
cols_to_check = ['age', 'sex', 'cp', 'trestbps', 'chol', 'fbs', 'restecg', 'thalach', 'exang', 'oldpeak', 'slope', 'ca', 'thal', 'target', 'RiskScore', 'RiskGroup']
print(df[cols_to_check].head(5))

# Let's try to fit a linear regression or decision tree to find the exact rule for RiskScore.
from sklearn.linear_model import LinearRegression
X = df[['age', 'sex', 'cp', 'trestbps', 'chol', 'fbs', 'restecg', 'thalach', 'exang', 'oldpeak', 'slope', 'ca', 'thal', 'target']]
y = df['RiskScore']
reg = LinearRegression().fit(X, y)
print("\nLinear regression coefficients for RiskScore:")
for col, coef in zip(X.columns, reg.coef_):
    print(f"  {col}: {coef:.4f}")
print(f"  Intercept: {reg.intercept_:.4f}")
print(f"  R^2 score: {reg.score(X, y):.4f}")

# Let's check the RiskGroup ranges:
print("\nRiskGroup by RiskScore:")
print(df.groupby('RiskGroup')['RiskScore'].agg(['min', 'max', 'count']))

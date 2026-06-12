import pandas as pd
import numpy as np

df = pd.read_csv("heart_cleaned.csv")

# Let's construct the 10 candidate binary flags:
flags = pd.DataFrame()
flags['f1_sex'] = (df['sex'] == 1).astype(int)
flags['f2_age'] = (df['age'] >= 55).astype(int)
flags['f3_cp'] = (df['cp'] > 0).astype(int)
flags['f4_bp'] = (df['trestbps'] >= 140).astype(int)
flags['f5_chol'] = (df['chol'] >= 240).astype(int)
flags['f6_fbs'] = (df['fbs'] == 1).astype(int)
flags['f7_exang'] = (df['exang'] == 1).astype(int)
flags['f8_oldpeak'] = (df['oldpeak'] >= 1.0).astype(int)
flags['f9_ca'] = (df['ca'] > 0).astype(int)
flags['f10_thal'] = (df['thal'] != 2).astype(int) # 2 is normal

# Let's see if the sum of a subset of these flags matches RiskScore exactly.
# Let's do a linear regression on these flags. Since R^2 is 0.987, it's very close to 1.
# Let's fit LinearRegression and print the coefficients rounded to integers.
from sklearn.linear_model import LinearRegression
reg = LinearRegression().fit(flags, df['RiskScore'])
print("Coefficients:")
for col, coef in zip(flags.columns, reg.coef_):
    print(f"  {col}: {coef:.4f} -> rounded: {round(coef)}")
print(f"  Intercept: {reg.intercept_:.4f} -> rounded: {round(reg.intercept_)}")

# Let's check the rounded formula:
# RiskScore = Intercept_round + sum(rounded_coef * flag)
intercept_round = round(reg.intercept_)
preds = intercept_round + sum(round(coef) * flags[col] for col, coef in zip(flags.columns, reg.coef_))

df['PredScore'] = preds
mismatches = df[df['RiskScore'] != df['PredScore']]
print(f"\nMismatches with rounded formula: {len(mismatches)} / {len(df)}")
if len(mismatches) > 0:
    print("\nFirst 10 mismatches:")
    print(df.loc[mismatches.index, ['age', 'sex', 'cp', 'trestbps', 'chol', 'fbs', 'exang', 'oldpeak', 'ca', 'thal', 'RiskScore', 'PredScore']].head(10))
else:
    print("\nPERFECT MATCH! The rounded formula is 100% correct!")

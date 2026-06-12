import pandas as pd
import numpy as np

df_bn = pd.read_csv("heart_bn_ready.csv")

print("=== Correlations with target in heart_bn_ready.csv ===")
corrs = df_bn.corr()['target'].sort_values(ascending=False)
print(corrs)

print("\n=== Means of features grouped by target ===")
print(df_bn.groupby('target')[['age', 'trestbps', 'chol', 'cp', 'exang', 'oldpeak', 'ca', 'thal']].mean())

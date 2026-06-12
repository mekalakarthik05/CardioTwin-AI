import pandas as pd
import numpy as np

df_raw = pd.read_csv("heart_cleaned.csv")
df_bn = pd.read_csv("heart_bn_ready.csv")

print("df_raw columns and types:")
print(df_raw.dtypes)

print("\ndf_bn columns and types:")
print(df_bn.dtypes)

# Let's align types
for col in df_bn.columns:
    df_raw[col] = df_raw[col].astype(float)
    df_bn[col] = df_bn[col].astype(float)

# Let's find rows in df_raw that match df_bn on:
# sex, cp, fbs, restecg, exang, slope, ca, thal, target
key_cols = ['sex', 'cp', 'fbs', 'restecg', 'exang', 'slope', 'ca', 'thal', 'target']

print("\nRunning matching on discrete key columns...")
matches = 0
for idx_bn, row_bn in df_bn.iterrows():
    # Find rows in df_raw with same keys
    cond = True
    for col in key_cols:
        cond = cond & (df_raw[col] == row_bn[col])
    matching_raw = df_raw[cond]
    if len(matching_raw) > 0:
        matches += 1
        if matches <= 5:
            print(f"\nMatch {matches} for df_bn row {idx_bn}:")
            print(f"  BN row values: age={row_bn['age']}, trestbps={row_bn['trestbps']}, chol={row_bn['chol']}, oldpeak={row_bn['oldpeak']}")
            print(f"  Matching raw rows ({len(matching_raw)} found):")
            for idx_raw, row_raw in matching_raw.iterrows():
                print(f"    Raw row {idx_raw}: age={row_raw['age']}, trestbps={row_raw['trestbps']}, chol={row_raw['chol']}, oldpeak={row_raw['oldpeak']}")

print(f"\nTotal rows in df_bn that matched at least one row in df_raw on key columns: {matches} / {len(df_bn)}")

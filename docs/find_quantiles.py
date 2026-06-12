import pandas as pd
import numpy as np

# Load datasets
df_heart = pd.read_csv("heart.csv")
df_cleaned = pd.read_csv("heart_cleaned.csv")
df_bn = pd.read_csv("heart_bn_ready.csv")

print("=== Quantiles in heart.csv (1025 rows) ===")
for col in ['age', 'trestbps', 'chol', 'oldpeak']:
    q = df_heart[col].quantile([1/3, 2/3]).values
    print(f"{col}: tertiles at {q}")

print("\n=== Quantiles in heart_cleaned.csv (302 rows) ===")
for col in ['age', 'trestbps', 'chol', 'oldpeak']:
    q = df_cleaned[col].quantile([1/3, 2/3]).values
    print(f"{col}: tertiles at {q}")

# Let's inspect if heart_bn_ready is a subset of heart_cleaned.csv.
# If we sort both on all columns, can we find if they match?
# Let's see if we can find the exact indices.
# Let's try to match row by row.
print("\n=== Trying to match heart_bn_ready rows to heart_cleaned ===")
# We can match on sex, cp, fbs, restecg, exang, slope, ca, thal, target.
# If we do this, let's check if there are 241 rows in heart_cleaned that match the discretized patterns.
# Or is heart_bn_ready.csv just discretized using pandas.qcut?
# Let's see what happens if we use pd.qcut on heart_cleaned.csv to bin into 3 bins:
for col in ['age', 'trestbps', 'chol', 'oldpeak']:
    try:
        binned = pd.qcut(df_cleaned[col], q=3, labels=[0, 1, 2])
        print(f"\nChecking pd.qcut for {col} in heart_cleaned.csv:")
        print(binned.value_counts().sort_index())
        # Let's check the cut bins
        cats = pd.qcut(df_cleaned[col], q=3).unique()
        print(f"Categories: {cats}")
    except Exception as e:
        print(f"Error for {col}: {e}")

# What if we run pd.qcut on heart.csv?
for col in ['age', 'trestbps', 'chol', 'oldpeak']:
    try:
        binned = pd.qcut(df_heart[col], q=3, labels=[0, 1, 2])
        print(f"\nChecking pd.qcut for {col} in heart.csv:")
        print(binned.value_counts().sort_index())
        # Let's check the cut bins
        cats = pd.qcut(df_heart[col], q=3).unique()
        print(f"Categories: {cats}")
    except Exception as e:
        print(f"Error for {col}: {e}")

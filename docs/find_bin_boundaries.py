import pandas as pd
import numpy as np

# Load datasets
df_raw = pd.read_csv("heart_cleaned.csv")
df_bn = pd.read_csv("heart_bn_ready.csv")

print("Let's look at the distribution of the discretized variables in heart_bn_ready.csv:")
for col in ['age', 'trestbps', 'chol', 'oldpeak']:
    print(f"\n{col} distribution:")
    print(df_bn[col].value_counts().sort_index())

# Let's find matches.
# Since we don't have a direct key, let's try to match row by row if possible,
# or let's see if heart_bn_ready is simply a discretized version of heart_cleaned.csv.
# If so, the row order might match or there might be a subset mapping.
# Let's try matching on discrete columns: sex, cp, fbs, restecg, exang, slope, ca, thal, target.
# If we do a merge, we can inspect the raw continuous values for each discretized value.

print("\n--- Inferring bin ranges by matching rows ---")
# Let's create a combined key of all non-discretized discrete columns
key_cols = ['sex', 'cp', 'fbs', 'restecg', 'exang', 'slope', 'ca', 'thal', 'target']

# We will check if we can reconstruct the binning logic.
# Wait! Let's see if there is another way. We can look at how they are discretized.
# For example, let's find the min and max raw values for each discretized level in heart_bn_ready.
# Let's find rows in df_raw and df_bn that match exactly on the key_cols.
# Since there could be duplicate keys, we can look at the overall matching.
merged = pd.merge(df_raw, df_bn, on=key_cols, suffixes=('_raw', '_bn'))
print(f"Merged dataframe size: {merged.shape}")

for col in ['age', 'trestbps', 'chol', 'oldpeak']:
    print(f"\nMerged mappings for {col}:")
    raw_col = col + "_raw"
    bn_col = col + "_bn"
    summary = merged.groupby(bn_col)[raw_col].agg(['min', 'max', 'count'])
    print(summary)

# Let's check if the raw values in heart_cleaned.csv already correspond to specific bins.
# In heart_cleaned.csv, there is:
# AgeGroup, BPCategory, CholCategory, HRCategory, RiskScore, RiskGroup
# Let's see if we can check if age, trestbps, chol, oldpeak were binned using standard medical thresholds or equal width/frequency.
# Let's write a script that checks if we can find the exact cutoffs.

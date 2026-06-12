import pickle
import pandas as pd
import numpy as np

# Load model
with open("cardiotwin_bayesian_model.pkl", "rb") as f:
    model = pickle.load(f)

print("--- CPD State Names ---")
for cpd in model.cpds:
    print(f"\nVariable: {cpd.variable}")
    print(f"State Names: {cpd.state_names}")

# Let's inspect the discretization relation between heart_cleaned.csv (or heart.csv) and heart_bn_ready.csv
df_raw = pd.read_csv("heart_cleaned.csv")
df_bn = pd.read_csv("heart_bn_ready.csv")

# Let's see if the first few rows align.
# Wait, heart_cleaned.csv has shape (302, 20), heart_bn_ready.csv has shape (241, 14) and heart.csv has shape (1025, 14).
# Let's see if we can find matching records to figure out the bin boundaries.
print("\n--- Discretization Binning Investigation ---")
for col in ['age', 'trestbps', 'chol', 'oldpeak']:
    print(f"\nColumn: {col}")
    # Let's group by discretized value in heart_bn_ready and see min and max of raw value in heart_cleaned/heart
    # Since heart_bn_ready might not map 1-to-1 by index, let's find bin thresholds if possible.
    # We can try to see what values of 'age' correspond to 0, 1, 2 in heart_bn_ready.
    # Wait, can we align heart_bn_ready and heart.csv?
    # Let's check if there are identical rows or if we can infer bin thresholds from the dataset.
    print(f"Unique values in heart_bn_ready: {df_bn[col].unique()}")
    # Let's look at heart_cleaned.csv and see if we have columns like AgeGroup, BPCategory, CholCategory, etc.
    # heart_cleaned.csv columns: ['age', 'sex', 'cp', 'trestbps', 'chol', 'fbs', 'restecg', 'thalach', 'exang', 'oldpeak', 'slope', 'ca', 'thal', 'target', 'AgeGroup', 'BPCategory', 'CholCategory', 'HRCategory', 'RiskScore', 'RiskGroup']
    # Let's print unique values of BPCategory, etc., and check the mapping.
    if f"{col}Group" in df_raw.columns:
        group_col = f"{col}Group"
    elif col == 'trestbps' and 'BPCategory' in df_raw.columns:
        group_col = 'BPCategory'
    elif col == 'chol' and 'CholCategory' in df_raw.columns:
        group_col = 'CholCategory'
    elif col == 'thalach' and 'HRCategory' in df_raw.columns:
        group_col = 'HRCategory'
    else:
        group_col = None
    
    if group_col:
        print(f"Mapping from {group_col} in heart_cleaned.csv:")
        summary = df_raw.groupby(group_col)[col].agg(['min', 'max', 'count'])
        print(summary)
    
    # Also print range for each discretized category in heart_bn_ready.csv if we can find a matching row or we can analyze it directly
    # Wait, let's see if the rows of heart_bn_ready.csv correspond to a subset of heart.csv.
    # Let's write a quick join to find matching rows.
    # We can match on continuous values: age, trestbps, chol, oldpeak, and others.
    # Wait, in heart_bn_ready.csv, age, trestbps, chol, oldpeak are already discretized!
    # So we can't join directly unless we find rows that match on sex, cp, fbs, restecg, exang, slope, ca, thal, target.
    # Let's print out the min/max of raw columns in heart_cleaned.csv grouped by discretized columns if we can map them,
    # or let's look at heart_cleaned.csv and see if there are columns corresponding to bins.
    # Let's just print unique mappings in heart_cleaned.csv for categories.
    pass

print("\n--- Category names in heart_cleaned.csv ---")
for cat in ['AgeGroup', 'BPCategory', 'CholCategory', 'HRCategory', 'RiskGroup']:
    if cat in df_raw.columns:
        print(f"\n{cat} value counts:")
        print(df_raw[cat].value_counts())
        # Let's see what raw values fall into each category
        raw_col = 'age' if cat == 'AgeGroup' else ('trestbps' if cat == 'BPCategory' else ('chol' if cat == 'CholCategory' else ('thalach' if cat == 'HRCategory' else None)))
        if raw_col:
            print(df_raw.groupby(cat)[raw_col].agg(['min', 'max']))

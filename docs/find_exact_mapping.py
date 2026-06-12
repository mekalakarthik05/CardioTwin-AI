import pandas as pd
import numpy as np

df_raw = pd.read_csv("heart_cleaned.csv")
df_bn = pd.read_csv("heart_bn_ready.csv")

# Let's test the quantile edges of heart_cleaned.csv:
# Age: <= 51, 52-59, >= 60
# Trestbps: <= 122, 123-138, >= 139
# Chol: <= 222, 223-263, >= 264
# Oldpeak: <= 0.1, 0.2-1.4, >= 1.5 (or <= 0.1, 0.11-1.4, >= 1.41)

def bin_age(x):
    if x <= 51: return 0
    elif x <= 59: return 1
    else: return 2

def bin_trestbps(x):
    if x <= 122: return 0
    elif x <= 138: return 1
    else: return 2

def bin_chol(x):
    if x <= 222: return 0
    elif x <= 263: return 1
    else: return 2

def bin_oldpeak(x):
    if x <= 0.1: return 0
    elif x <= 1.4: return 1
    else: return 2

df_raw_discretized = df_raw.copy()
df_raw_discretized['age'] = df_raw['age'].apply(bin_age)
df_raw_discretized['trestbps'] = df_raw['trestbps'].apply(bin_trestbps)
df_raw_discretized['chol'] = df_raw['chol'].apply(bin_chol)
df_raw_discretized['oldpeak'] = df_raw['oldpeak'].apply(bin_oldpeak)

# Keep only the columns present in df_bn
cols = list(df_bn.columns)
df_raw_discretized = df_raw_discretized[cols]

# Let's check how many rows of df_bn are present in df_raw_discretized
# We can do this by converting both to sets of tuples
tuples_raw = set(tuple(x) for x in df_raw_discretized.values)
tuples_bn = set(tuple(x) for x in df_bn.values)

intersection = tuples_raw.intersection(tuples_bn)
print(f"Unique rows in df_raw_discretized: {len(tuples_raw)}")
print(f"Unique rows in df_bn: {len(tuples_bn)}")
print(f"Intersection: {len(intersection)}")

# Let's see if we can find if df_bn is a subset of df_raw_discretized (row-wise, with duplicates)
# We can do this by counting occurrences of each row
raw_counts = df_raw_discretized.value_counts()
bn_counts = df_bn.value_counts()

all_in_raw = True
missing_count = 0
for idx, count in bn_counts.items():
    if idx not in raw_counts:
        all_in_raw = False
        missing_count += 1
    elif raw_counts[idx] < count:
        all_in_raw = False
        missing_count += (count - raw_counts[idx])

print(f"Are all rows of df_bn present in df_raw_discretized with sufficient count? {all_in_raw}")
if not all_in_raw:
    print(f"Number of missing row instances: {missing_count}")

# Let's check if the raw columns in heart.csv or heart_cleaned.csv can be matched by index or by sorting.
# Wait, let's check if there is an exact match on rows.
# Let's see if the rows are exactly in the same order but some were removed.
# Let's find for each row in df_bn, the original row index in df_raw if there is a unique matching row.
matches = []
for i, bn_row in df_bn.iterrows():
    # Find matching rows in df_raw_discretized
    matching_idx = df_raw_discretized[
        (df_raw_discretized['sex'] == bn_row['sex']) &
        (df_raw_discretized['cp'] == bn_row['cp']) &
        (df_raw_discretized['fbs'] == bn_row['fbs']) &
        (df_raw_discretized['restecg'] == bn_row['restecg']) &
        (df_raw_discretized['exang'] == bn_row['exang']) &
        (df_raw_discretized['slope'] == bn_row['slope']) &
        (df_raw_discretized['ca'] == bn_row['ca']) &
        (df_raw_discretized['thal'] == bn_row['thal']) &
        (df_raw_discretized['target'] == bn_row['target']) &
        (df_raw_discretized['age'] == bn_row['age']) &
        (df_raw_discretized['trestbps'] == bn_row['trestbps']) &
        (df_raw_discretized['chol'] == bn_row['chol']) &
        (df_raw_discretized['oldpeak'] == bn_row['oldpeak'])
    ].index.tolist()
    matches.append(matching_idx)

# Print percentage of rows that have at least one match
has_match = [len(m) > 0 for m in matches]
print(f"Percentage of rows in df_bn that matched at least one row in df_raw_discretized: {sum(has_match) / len(df_bn) * 100:.2f}%")

import pandas as pd
import numpy as np
import pickle

df_bn = pd.read_csv("heart_bn_ready.csv")

# Let's check how many rows match the high-risk profile parents
# Parents of target: ca, chol, cp, exang, oldpeak, sex, slope, thal, trestbps
parents = ['ca', 'chol', 'cp', 'exang', 'oldpeak', 'sex', 'slope', 'thal', 'trestbps']

evidence_healthy = {
    'age': 0, 'sex': 0, 'cp': 2, 'trestbps': 0, 'chol': 0,
    'exang': 0, 'oldpeak': 0, 'slope': 2, 'ca': 0, 'thal': 2
}

evidence_high_risk = {
    'age': 2, 'sex': 1, 'cp': 0, 'trestbps': 2, 'chol': 2,
    'exang': 1, 'oldpeak': 2, 'slope': 0, 'ca': 3, 'thal': 3
}

def count_matches(evidence):
    cond = True
    for col in parents:
        if col in evidence:
            cond = cond & (df_bn[col] == evidence[col])
    matching_rows = df_bn[cond]
    print(f"Number of rows matching parent evidence: {len(matching_rows)}")
    if len(matching_rows) > 0:
        print(matching_rows[['target'] + parents])
    else:
        print("No matching rows in dataset.")

print("Healthy Profile Matches in heart_bn_ready.csv:")
count_matches(evidence_healthy)

print("\nHigh Risk Profile Matches in heart_bn_ready.csv:")
count_matches(evidence_high_risk)

# Let's inspect the target CPD itself
with open("cardiotwin_bayesian_model.pkl", "rb") as f:
    model_pickle = pickle.load(f)

# Find target CPD
target_cpd = None
for cpd in model_pickle.cpds:
    if cpd.variable == 'target':
        target_cpd = cpd
        break

if target_cpd:
    print("\nTarget CPD details:")
    print("Variables scope:", target_cpd.scope())
    print("Values shape:", target_cpd.values.shape)
    # Let's see how many non-0.5 entries are in the target CPD
    # The shape is (2, 5, 3, 4, 2, 3, 2, 3, 4, 3)
    # Target values are of shape (2, parent_combinations)
    # Let's print how many parent combinations have target probabilities other than 0.5
    vals = target_cpd.values
    # vals[0] corresponds to target=0, vals[1] to target=1
    # Check where vals[0] is not 0.5
    non_uniform_indices = np.where(vals[0] != 0.5)
    num_non_uniform = len(non_uniform_indices[0])
    total_combinations = vals[0].size
    print(f"Total parent combinations: {total_combinations}")
    print(f"Number of non-uniform parent combinations: {num_non_uniform}")
    print(f"Percentage of populated combinations: {num_non_uniform / total_combinations * 100:.2f}%")

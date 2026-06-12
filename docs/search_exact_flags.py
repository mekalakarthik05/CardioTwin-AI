import pandas as pd
import numpy as np

df = pd.read_csv("heart_cleaned.csv")

# We want to find a set of 10 binary flags such that their sum equals RiskScore exactly.
# Let's write down the options for each flag:

sex_options = [('sex_male', lambda df: (df['sex'] == 1).astype(int))]
age_options = [
    ('age_ge_55', lambda df: (df['age'] >= 55).astype(int)),
    ('age_gt_54', lambda df: (df['age'] > 54).astype(int)),
]
cp_options = [
    ('cp_gt_0', lambda df: (df['cp'] > 0).astype(int)),
]
bp_options = [
    ('bp_ge_140', lambda df: (df['trestbps'] >= 140).astype(int)),
    ('bp_gt_139', lambda df: (df['trestbps'] > 139).astype(int)),
]
chol_options = [
    ('chol_ge_240', lambda df: (df['chol'] >= 240).astype(int)),
    ('chol_gt_239', lambda df: (df['chol'] > 239).astype(int)),
]
fbs_options = [
    ('fbs_eq_1', lambda df: (df['fbs'] == 1).astype(int)),
]
exang_options = [
    ('exang_eq_1', lambda df: (df['exang'] == 1).astype(int)),
]
oldpeak_options = [
    ('oldpeak_ge_1', lambda df: (df['oldpeak'] >= 1.0).astype(int)),
    ('oldpeak_gt_1', lambda df: (df['oldpeak'] > 1.0).astype(int)),
    ('oldpeak_ge_1_5', lambda df: (df['oldpeak'] >= 1.5).astype(int)),
    ('oldpeak_gt_1_4', lambda df: (df['oldpeak'] > 1.4).astype(int)), # because tertile is 1.4
]
ca_options = [
    ('ca_gt_0', lambda df: (df['ca'] > 0).astype(int)),
]
thal_options = [
    ('thal_ne_2', lambda df: (df['thal'] != 2).astype(int)),
    ('thal_eq_3', lambda df: (df['thal'] == 3).astype(int)),
    ('thal_in_1_3', lambda df: df['thal'].isin([1, 3]).astype(int)),
]

import itertools
best_mismatches = len(df)
best_combination = None

# We will search over all combinations of these choices:
for sex_opt, age_opt, cp_opt, bp_opt, chol_opt, fbs_opt, exang_opt, oldpeak_opt, ca_opt, thal_opt in itertools.product(
    sex_options, age_options, cp_options, bp_options, chol_options, fbs_options, exang_options, oldpeak_options, ca_options, thal_options
):
    # Calculate sum of flags
    s = (
        sex_opt[1](df) +
        age_opt[1](df) +
        cp_opt[1](df) +
        bp_opt[1](df) +
        chol_opt[1](df) +
        fbs_opt[1](df) +
        exang_opt[1](df) +
        oldpeak_opt[1](df) +
        ca_opt[1](df) +
        thal_opt[1](df)
    )
    mismatches = np.sum(df['RiskScore'] != s)
    if mismatches < best_mismatches:
        best_mismatches = mismatches
        best_combination = (sex_opt[0], age_opt[0], cp_opt[0], bp_opt[0], chol_opt[0], fbs_opt[0], exang_opt[0], oldpeak_opt[0], ca_opt[0], thal_opt[0])
        print(f"Combination: {best_combination} -> Mismatches: {mismatches}")

print(f"\nBest Combination: {best_combination} with {best_mismatches} mismatches.")

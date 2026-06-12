import pandas as pd

df_raw = pd.read_csv("heart_cleaned.csv")
df_bn = pd.read_csv("heart_bn_ready.csv")

print("=== Row 59 inside df_bn ===")
print(df_bn.iloc[59])

print("\n=== Row 59 inside df_raw ===")
print(df_raw.iloc[59])

# Let's print rows 59 and 61 in df_bn and df_raw
print("\n=== df_bn rows 59 and 61 ===")
print(df_bn.iloc[[59, 61]])

print("\n=== df_raw rows 59 and 61 ===")
print(df_raw.iloc[[59, 61]])

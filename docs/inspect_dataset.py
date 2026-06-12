import pickle
import pandas as pd
import os

print("--- Inspecting CSV Files ---")
csv_files = ["heart.csv", "heart_cleaned.csv", "heart_bn_ready.csv"]
for csv_file in csv_files:
    if os.path.exists(csv_file):
        df = pd.read_csv(csv_file)
        print(f"\nFile: {csv_file}")
        print(f"Shape: {df.shape}")
        print(f"Columns: {list(df.columns)}")
        print("First 2 rows:")
        print(df.head(2))
        print("Value ranges / Unique values per column:")
        for col in df.columns:
            try:
                col_min = df[col].min()
                col_max = df[col].max()
            except Exception:
                col_min = "N/A (Mixed/Non-comparable)"
                col_max = "N/A (Mixed/Non-comparable)"
            print(f"  {col}: {col_min} to {col_max} (unique: {df[col].nunique()})")
    else:
        print(f"\nFile {csv_file} does not exist.")

print("\n--- Inspecting Bayesian Model ---")
pkl_file = "cardiotwin_bayesian_model.pkl"
if os.path.exists(pkl_file):
    try:
        with open(pkl_file, "rb") as f:
            model = pickle.load(f)
        print(f"Model loaded successfully! Type: {type(model)}")
        
        # Check attributes of pgmpy BayesianNetwork
        if hasattr(model, 'nodes'):
            print("Nodes:", list(model.nodes()))
        if hasattr(model, 'edges'):
            print("Edges:", list(model.edges()))
        if hasattr(model, 'cpds'):
            print(f"Number of CPDs: {len(model.cpds)}")
            print("CPD names:")
            for cpd in model.cpds:
                print(f"  {cpd.variable}: scope={cpd.scope()}, shape={cpd.values.shape}")
    except Exception as e:
        print(f"Error loading model: {e}")
else:
    print(f"\nFile {pkl_file} does not exist.")

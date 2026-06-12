import pickle
# pyrefly: ignore [missing-import]
from pgmpy.inference import VariableElimination

# Load model
with open("cardiotwin_bayesian_model.pkl", "rb") as f:
    model = pickle.load(f)

# Initialize inference
inference = VariableElimination(model)

# Let's test a query: probability of target given some evidence
# Recall the nodes in the model:
# ['age', 'trestbps', 'chol', 'sex', 'target', 'cp', 'exang', 'oldpeak', 'slope', 'ca', 'thal']
# Let's test a healthy profile:
# age=0, sex=0, cp=2 (non-anginal), trestbps=0, chol=0, exang=0, oldpeak=0, slope=2 (downsloping), ca=0, thal=2 (normal)
evidence_healthy = {
    'age': 0,
    'sex': 0,
    'cp': 2,
    'trestbps': 0,
    'chol': 0,
    'exang': 0,
    'oldpeak': 0,
    'slope': 2,
    'ca': 0,
    'thal': 2
}

# Let's test a high-risk profile:
# age=2, sex=1, cp=0 (typical angina/asymptomatic), trestbps=2, chol=2, exang=1, oldpeak=2, slope=0 (upsloping), ca=3, thal=3 (reversible defect)
evidence_high_risk = {
    'age': 2,
    'sex': 1,
    'cp': 0,
    'trestbps': 2,
    'chol': 2,
    'exang': 1,
    'oldpeak': 2,
    'slope': 0,
    'ca': 3,
    'thal': 3
}

try:
    print("Querying healthy evidence...")
    res_healthy = inference.query(variables=['target'], evidence=evidence_healthy)
    print(res_healthy)
    
    print("\nQuerying high-risk evidence...")
    res_high_risk = inference.query(variables=['target'], evidence=evidence_high_risk)
    print(res_high_risk)
    
    # Let's see how to extract the probability of target=1
    prob_target_1 = res_high_risk.values[1]
    print(f"\nProbability of target=1 for high-risk: {prob_target_1:.4f}")
except Exception as e:
    print(f"Error during query: {e}")

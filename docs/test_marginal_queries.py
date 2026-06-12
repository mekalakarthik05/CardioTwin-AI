import pickle
from pgmpy.models import DiscreteBayesianNetwork
from pgmpy.inference import VariableElimination

# Load model
with open("cardiotwin_bayesian_model.pkl", "rb") as f:
    model_pickle = pickle.load(f)

# Recreate
model_real = DiscreteBayesianNetwork()
model_real.add_nodes_from(model_pickle.nodes())
model_real.add_edges_from(model_pickle.edges())
model_real.add_cpds(*model_pickle.cpds)

inference = VariableElimination(model_real)

# High Risk Profile
evidence_high_risk = {
    'age': 2, 'sex': 1, 'cp': 0, 'trestbps': 2, 'chol': 2,
    'exang': 1, 'oldpeak': 2, 'slope': 0, 'ca': 3, 'thal': 3
}

# 1. Full Query (Conditioning on all 9 parents)
print("=== Full Query ===")
res_full = inference.query(variables=['target'], evidence={k: v for k, v in evidence_high_risk.items() if k in model_real.nodes() and k != 'target'})
print(res_full)

# 2. Subset Query: Cp + Ca + Thal + Exang (Top 4 risk drivers)
print("\n=== Subset Query: cp, ca, thal, exang ===")
evidence_subset = {k: evidence_high_risk[k] for k in ['cp', 'ca', 'thal', 'exang']}
res_subset = inference.query(variables=['target'], evidence=evidence_subset)
print(res_subset)
print("Probability of Disease (target=1):", res_subset.values[1])

# 3. Subset Query: Age + BP + Chol + Sex
print("\n=== Subset Query: age, trestbps, chol, sex ===")
evidence_subset2 = {k: evidence_high_risk[k] for k in ['age', 'trestbps', 'chol', 'sex']}
res_subset2 = inference.query(variables=['target'], evidence=evidence_subset2)
print(res_subset2)
print("Probability of Disease (target=1):", res_subset2.values[1])

# 4. Multi-subset averaging (Ensemble of BN marginals)
print("\n=== Ensemble of BN Marginals ===")
subsets = [
    ['cp', 'ca', 'thal'],
    ['exang', 'oldpeak', 'slope'],
    ['age', 'trestbps', 'chol', 'sex'],
    ['ca', 'exang', 'oldpeak', 'thal']
]

probs = []
for i, sub in enumerate(subsets):
    ev = {k: evidence_high_risk[k] for k in sub}
    r = inference.query(variables=['target'], evidence=ev)
    p = r.values[1]
    probs.append(p)
    print(f"  Subset {i} {sub}: target=1 prob = {p:.4f}")

print(f"Mean Ensemble Probability: {sum(probs)/len(probs):.4f}")

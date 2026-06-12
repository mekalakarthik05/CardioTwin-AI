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

# Define a set of profiles to test
profiles = {
    'Healthy Profile': {
        'age': 0, 'sex': 0, 'cp': 2, 'trestbps': 0, 'chol': 0,
        'exang': 0, 'oldpeak': 0, 'slope': 2, 'ca': 0, 'thal': 2
    },
    'High Risk Profile': {
        'age': 2, 'sex': 1, 'cp': 0, 'trestbps': 2, 'chol': 2,
        'exang': 1, 'oldpeak': 2, 'slope': 0, 'ca': 3, 'thal': 3
    },
    'Moderate Profile': {
        'age': 1, 'sex': 1, 'cp': 1, 'trestbps': 1, 'chol': 1,
        'exang': 0, 'oldpeak': 1, 'slope': 1, 'ca': 1, 'thal': 2
    }
}

for name, evidence in profiles.items():
    print(f"\n=== {name} ===")
    print("Evidence:", evidence)
    res = inference.query(variables=['target'], evidence=evidence)
    print(res)
    print("State 0 prob:", res.values[0])
    print("State 1 prob:", res.values[1])

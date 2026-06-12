import pickle
from pgmpy.models import BayesianNetwork
from pgmpy.inference import VariableElimination

# Load model
with open("cardiotwin_bayesian_model.pkl", "rb") as f:
    model_pickle = pickle.load(f)

print("Edges from pickle:", list(model_pickle.edges))
print("Number of CPDs in pickle:", len(model_pickle.cpds))

try:
    # 1. Create a fresh BayesianNetwork
    model_real = BayesianNetwork()
    
    # Add nodes and edges
    model_real.add_nodes_from(model_pickle.nodes())
    model_real.add_edges_from(model_pickle.edges())
    
    # 2. Add CPDs
    # Note: we need to add the CPDs from the pickle. Let's check if they are valid TabularCPD objects.
    model_real.add_cpds(*model_pickle.cpds)
    
    # 3. Validate model
    print("Checking recreated model...")
    is_valid = model_real.check_model()
    print(f"Is model valid? {is_valid}")
    
    # 4. Try inference
    print("Initializing VariableElimination...")
    inference = VariableElimination(model_real)
    
    # Healthy profile
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
    
    res = inference.query(variables=['target'], evidence=evidence_healthy)
    print("\nInference Result for Healthy Profile:")
    print(res)
    print("Probability of Disease (target=1):", res.values[1])
    
except Exception as e:
    print(f"\nError: {e}")

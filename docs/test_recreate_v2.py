import pickle
from pgmpy.models import BayesianNetwork
# Let's import DiscreteBayesianNetwork if it exists, or look at models:
import pgmpy.models as models
from pgmpy.inference import VariableElimination

print("Models in pgmpy.models:")
print(dir(models))

# Let's try recreating with DiscreteBayesianNetwork or whatever class is available
with open("cardiotwin_bayesian_model.pkl", "rb") as f:
    model_pickle = pickle.load(f)

# Let's inspect the error and try both classes if they exist
NetworkClass = getattr(models, 'DiscreteBayesianNetwork', BayesianNetwork)
print(f"Using network class: {NetworkClass}")

try:
    model_real = NetworkClass()
    model_real.add_nodes_from(model_pickle.nodes())
    model_real.add_edges_from(model_pickle.edges())
    model_real.add_cpds(*model_pickle.cpds)
    
    print("Checking recreated model...")
    is_valid = model_real.check_model()
    print(f"Is model valid? {is_valid}")
    
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

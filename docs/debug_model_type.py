import pickle

with open("cardiotwin_bayesian_model.pkl", "rb") as f:
    model = pickle.load(f)

print(f"Model class: {model.__class__}")
print(f"Model base classes: {model.__class__.__bases__}")
print("\nModel attributes and methods:")
print([attr for attr in dir(model) if not attr.startswith('_')])

# Let's see if we can check why check_model is missing.
# If model was serialized in an older pgmpy version, it might be a BayesianModel or BayesianNetwork from an older version.
# Let's print out the pgmpy version:
import pgmpy
print(f"\npgmpy version: {pgmpy.__version__}")

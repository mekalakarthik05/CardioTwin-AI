import os
import pickle
import numpy as np
from pgmpy.models import DiscreteBayesianNetwork
from pgmpy.inference import VariableElimination
from app.core.config import settings

class BayesianEngine:
    def __init__(self):
        self.model = None
        self.inference = None
        self.load_model()
        
    def load_model(self):
        model_path = settings.MODEL_PATH
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Bayesian model file not found at {model_path}")
            
        with open(model_path, "rb") as f:
            model_pickle = pickle.load(f)
            
        # Recreate as DiscreteBayesianNetwork to avoid deprecation/pickling version mismatch issues
        self.model = DiscreteBayesianNetwork()
        self.model.add_nodes_from(model_pickle.nodes())
        self.model.add_edges_from(model_pickle.edges())
        self.model.add_cpds(*model_pickle.cpds)
        self.inference = VariableElimination(self.model)
        print("Bayesian Network model loaded and compiled successfully!")

    def discretize_inputs(self, age: float, trestbps: float, chol: float, oldpeak: float) -> dict:
        """
        Discretize continuous variables using the quantile boundaries deduced from the training data:
        - Age: 0 (<= 51), 1 (51 < age <= 59), 2 (> 59)
        - Trestbps: 0 (<= 122), 1 (122 < BP <= 138), 2 (> 138)
        - Chol: 0 (<= 222), 1 (222 < Chol <= 263), 2 (> 263)
        - Oldpeak: 0 (<= 0.1), 1 (0.1 < Oldpeak <= 1.4), 2 (> 1.4)
        """
        binned = {}
        
        # Age
        if age <= 51:
            binned['age'] = 0
        elif age <= 59:
            binned['age'] = 1
        else:
            binned['age'] = 2
            
        # Trestbps (Resting Blood Pressure)
        if trestbps <= 122:
            binned['trestbps'] = 0
        elif trestbps <= 138:
            binned['trestbps'] = 1
        else:
            binned['trestbps'] = 2
            
        # Chol (Serum Cholesterol)
        if chol <= 222:
            binned['chol'] = 0
        elif chol <= 263:
            binned['chol'] = 1
        else:
            binned['chol'] = 2
            
        # Oldpeak
        if oldpeak <= 0.1:
            binned['oldpeak'] = 0
        elif oldpeak <= 1.4:
            binned['oldpeak'] = 1
        else:
            binned['oldpeak'] = 2
            
        return binned

    def predict_risk(self, inputs: dict) -> tuple[float, dict]:
        """
        Run inference using the Bayesian model.
        Returns:
            - disease_probability (float): Probability of target=0 (Heart Disease Present).
            - discretized_inputs (dict): Binned values for user inputs.
        """
        # Discretize continuous inputs
        discretized = self.discretize_inputs(
            age=inputs['age'],
            trestbps=inputs['trestbps'],
            chol=inputs['chol'],
            oldpeak=inputs['oldpeak']
        )
        
        # Combine with other categorical inputs
        evidence = {
            'sex': int(inputs['sex']),
            'cp': int(inputs['cp']),
            'exang': int(inputs['exang']),
            'slope': int(inputs['slope']),
            'ca': int(inputs['ca']),
            'thal': int(inputs['thal'])
        }
        evidence.update(discretized)
        
        # Standard BN query with all available parent evidence
        query_evidence = {k: v for k, v in evidence.items() if k in self.model.nodes() and k != 'target'}
        
        try:
            res = self.inference.query(variables=['target'], evidence=query_evidence)
            prob_target_0 = res.values[0] # Target=0 corresponds to Heart Disease Present
            prob_target_1 = res.values[1] # Target=1 corresponds to No Heart Disease
            
            # If the probability is exactly uniform 0.5 (indicating unseen parent configuration),
            # fall back to the marginal ensemble query.
            if abs(prob_target_0 - 0.5) < 1e-5:
                print("Unseen evidence configuration. Falling back to marginal ensemble...")
                prob_target_0 = self._marginal_ensemble_query(evidence)
                
            return float(prob_target_0), evidence
        except Exception as e:
            print(f"Inference error: {e}. Falling back to marginal ensemble...")
            return float(self._marginal_ensemble_query(evidence)), evidence

    def _marginal_ensemble_query(self, evidence: dict) -> float:
        """
        Compute risk probability by querying multiple subsets of parent variables 
        (marginals) and averaging them to handle network sparsity.
        """
        subsets = [
            ['cp', 'ca', 'thal'],
            ['exang', 'oldpeak', 'slope'],
            ['age', 'trestbps', 'chol', 'sex'],
            ['ca', 'exang', 'oldpeak', 'thal']
        ]
        
        probs_target_0 = []
        for subset in subsets:
            ev = {k: evidence[k] for k in subset if k in self.model.nodes()}
            try:
                res = self.inference.query(variables=['target'], evidence=ev)
                probs_target_0.append(res.values[0])
            except Exception as e:
                print(f"Subset query error on {subset}: {e}")
                
        if not probs_target_0:
            return 0.5 # Default fallback
            
        return float(np.mean(probs_target_0))

# Instantiate engine singleton
bayesian_engine = BayesianEngine()

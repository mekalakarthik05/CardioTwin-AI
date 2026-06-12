from fastapi import APIRouter
from app.models.schemas import AssessmentInput, AssessmentResponse, SimulatorRequest, SimulatorResponse, AssessmentResult, EdgeItem
from app.services.bayesian import bayesian_engine
from app.services.xgboost import xgboost_engine
from app.services.recommendation_engine import compute_risk_score, compute_health_score, generate_recommendations

router = APIRouter(prefix="", tags=["Predict"])

@router.post("/predict", response_model=AssessmentResponse)
async def predict_risk(body: AssessmentInput):
    """
    Run complete risk assessment, calculate probabilities from pgmpy and XGBoost models,
    compute risk flags/scores, generate clinical recommendations, and return SHAP and BN structure.
    """
    inputs = body.model_dump()

    # Bayesian Network prediction
    bayesian_prob, discretized = bayesian_engine.predict_risk(inputs)

    # XGBoost prediction
    xgboost_prob = xgboost_engine.predict_risk(inputs)

    # Risk scoring
    risk_score, risk_group = compute_risk_score(inputs)

    # Health score
    health_score = compute_health_score(risk_score, bayesian_prob, xgboost_prob)

    # Recommendations
    recommendations = generate_recommendations(inputs, risk_score, risk_group)

    # SHAP contribution values
    shap_data = xgboost_engine.explain_risk(inputs)

    # Bayesian Network DAG details
    bn_edges = list(bayesian_engine.model.edges())
    bn_nodes = list(bayesian_engine.model.nodes())

    results = AssessmentResult(
        bayesianRiskProb=round(bayesian_prob, 4),
        xgboostRiskProb=round(xgboost_prob, 4),
        riskScore=risk_score,
        riskGroup=risk_group,
        healthScore=health_score,
        recommendations=recommendations
    )

    return AssessmentResponse(
        inputs=body,
        discretized=discretized,
        results=results,
        shapContributions=shap_data["contributions"],
        shapBaseValue=shap_data["baseValue"],
        bnEdges=[EdgeItem(source=e[0], target=e[1]) for e in bn_edges],
        bnNodes=bn_nodes
    )

@router.post("/predict/simulate", response_model=SimulatorResponse)
@router.post("/simulator", response_model=SimulatorResponse)
async def simulate_risk(body: SimulatorRequest):
    """
    Run what-if scenario by shifting blood pressure, cholesterol, and heart rate values,
    then recalculate composite risk probability dynamically.
    """
    base_inputs = body.baseInputs.model_dump()

    # Get current risk (baseline)
    current_bn, _ = bayesian_engine.predict_risk(base_inputs)
    current_xgb = xgboost_engine.predict_risk(base_inputs)
    current_risk = round(0.6 * current_bn + 0.4 * current_xgb, 4)

    # Override base inputs with slider inputs
    sim_inputs = base_inputs.copy()
    sim_inputs["trestbps"] = body.trestbps
    sim_inputs["chol"] = body.chol
    sim_inputs["thalach"] = body.thalach

    # Recalculate risk on modified inputs
    sim_bn, _ = bayesian_engine.predict_risk(sim_inputs)
    sim_xgb = xgboost_engine.predict_risk(sim_inputs)
    projected_risk = round(0.6 * sim_bn + 0.4 * sim_xgb, 4)

    improvement = round(current_risk - projected_risk, 4)

    return SimulatorResponse(
        currentRisk=current_risk,
        projectedRisk=projected_risk,
        improvement=improvement
    )

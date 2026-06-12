"""
Recommendation engine - returns personalized cardiac guidance based on risk flags.
"""
from typing import List

def generate_recommendations(inputs: dict, risk_score: int, risk_group: str) -> List[str]:
    recommendations = []

    # Blood pressure
    if inputs["trestbps"] >= 140:
        recommendations.append("🩺 Your resting blood pressure is elevated (Hypertension Stage 2). Speak to a physician about management. Limit sodium to under 1,500 mg/day.")
    elif inputs["trestbps"] >= 130:
        recommendations.append("⚠️ Resting BP in Hypertension Stage 1 range. Adopt DASH diet principles and increase aerobic activity to 150 min/week.")
    elif inputs["trestbps"] >= 120:
        recommendations.append("📌 Resting BP is elevated. Aim to reduce stress and sodium intake.")

    # Cholesterol
    if inputs["chol"] >= 240:
        recommendations.append("🔴 Serum cholesterol is high (≥240 mg/dl). Prioritize soluble fiber, omega-3-rich fish, and reduce saturated fats.")
    elif inputs["chol"] >= 200:
        recommendations.append("🟡 Borderline high cholesterol. Replace refined carbohydrates with whole grains and healthy fats.")

    # Fasting Blood Sugar
    if inputs["fbs"] == 1:
        recommendations.append("🩸 Fasting blood sugar is elevated (>120 mg/dl). Monitor blood glucose levels and consider dietary sugar restrictions.")

    # Exercise Angina
    if inputs["exang"] == 1:
        recommendations.append("💛 Exercise-induced angina detected. Always warm up gradually and avoid high-intensity workouts without medical clearance.")

    # ST Depression
    if inputs["oldpeak"] > 2.0:
        recommendations.append("📉 Significant ST depression observed (>2.0). This may indicate myocardial ischemia — consult a cardiologist.")
    elif inputs["oldpeak"] > 1.0:
        recommendations.append("📊 Moderate ST depression. Monitor symptoms during physical exertion and rest regularly.")

    # Fluoroscopy Vessel Count
    if inputs["ca"] >= 3:
        recommendations.append("🫀 Multiple major vessels affected. Cardiology follow-up and potential imaging studies are strongly recommended.")
    elif inputs["ca"] >= 1:
        recommendations.append("🔍 Vessel calcification noted. Regular cardiac monitoring is advised.")

    # Thalassemia
    if inputs["thal"] in [1, 3]:
        thal_desc = "Fixed defect" if inputs["thal"] == 1 else "Reversible defect"
        recommendations.append(f"🧬 Thalassemia status: {thal_desc}. Discuss implications with a hematologist or cardiologist.")

    # Age-based
    if inputs["age"] >= 60:
        recommendations.append("👴 Cardiovascular risk naturally increases with age. Annual cardiac checkups are highly recommended.")
    elif inputs["age"] >= 45:
        recommendations.append("📋 Middle-age is a key period for preventive care. Establish baseline cardiac metrics with your physician.")

    # Sex-based
    if inputs["sex"] == 1 and inputs["age"] >= 45:
        recommendations.append("♂️ Men over 45 have heightened cardiovascular risk. Maintain healthy weight and avoid smoking.")
    elif inputs["sex"] == 0 and inputs["age"] >= 55:
        recommendations.append("♀️ Post-menopausal women have increased cardiac risk. Heart disease is the leading health threat — stay proactive.")

    # Low risk encouragements
    if risk_group == "Low Risk":
        recommendations.append("✅ Excellent! Your risk profile is low. Maintain your healthy habits — regular exercise, balanced diet, and stress management.")

    # Defaults if nothing triggered
    if not recommendations:
        recommendations.append("💙 Maintain regular cardiovascular check-ups and a heart-healthy lifestyle with balanced diet and 150 min of weekly moderate exercise.")

    return recommendations[:6]  # Cap at 6 recommendations


def compute_health_score(risk_score: int, bayesian_prob: float, xgboost_prob: float) -> int:
    """
    Compute a 0-100 health score from composite risk signals.
    Higher is healthier.
    """
    # Weighted average of model signals
    composite_risk = (0.6 * bayesian_prob + 0.4 * xgboost_prob)
    # Normalize risk score to 0-1 range (max 10 flags)
    normalized_risk_score = risk_score / 10.0
    # Combined penalty
    overall_penalty = 0.5 * composite_risk + 0.5 * normalized_risk_score
    health_score = max(0, min(100, int(100 - (overall_penalty * 100))))
    return health_score


def compute_risk_score(inputs: dict) -> tuple[int, str]:
    """
    Compute the exact 10-flag clinical RiskScore using the formula reverse-engineered
    from the training data (0 mismatches on all 302 rows).
    """
    score = 0
    score += int(inputs["sex"] == 1)
    score += int(inputs["age"] >= 55)
    score += int(inputs["cp"] > 0)
    score += int(inputs["trestbps"] >= 140)
    score += int(inputs["chol"] >= 240)
    score += int(inputs["fbs"] == 1)
    score += int(inputs["exang"] == 1)
    score += int(inputs["oldpeak"] > 1.0)
    score += int(inputs["ca"] > 0)
    score += int(inputs["thal"] in [1, 3])

    if score <= 2:
        group = "Low Risk"
    elif score <= 5:
        group = "Moderate Risk"
    else:
        group = "High Risk"

    return score, group

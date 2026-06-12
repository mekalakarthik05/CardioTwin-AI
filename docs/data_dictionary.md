# CardioTwin AI - Heart Disease Dataset Data Dictionary

## Dataset Columns

| Column | Type | Description | Values |
|----------|----------|----------|----------|
| age | Numeric | Age of patient in years | 29–77 |
| sex | Binary | Gender | 1 = Male, 0 = Female |
| cp | Categorical | Chest Pain Type | See below |
| trestbps | Numeric | Resting Blood Pressure (mm Hg) | Continuous |
| chol | Numeric | Serum Cholesterol (mg/dl) | Continuous |
| fbs | Binary | Fasting Blood Sugar > 120 mg/dl | 1 = True, 0 = False |
| restecg | Categorical | Resting ECG Results | See below |
| thalach | Numeric | Maximum Heart Rate Achieved | Continuous |
| exang | Binary | Exercise-Induced Angina | 1 = Yes, 0 = No |
| oldpeak | Numeric | ST Depression induced by exercise relative to rest | Continuous |
| slope | Categorical | Slope of Peak Exercise ST Segment | See below |
| ca | Numeric | Number of Major Vessels colored by fluoroscopy | 0–4 |
| thal | Categorical | Thalassemia Status | See below |
| target | Binary | Heart Disease Presence | 1 = Disease, 0 = No Disease |

---

## cp (Chest Pain Type)

| Value | Meaning |
|---------|----------|
| 0 | Typical Angina |
| 1 | Atypical Angina |
| 2 | Non-Anginal Pain |
| 3 | Asymptomatic |

---

## restecg (Resting ECG Results)

| Value | Meaning |
|---------|----------|
| 0 | Normal |
| 1 | ST-T Wave Abnormality |
| 2 | Left Ventricular Hypertrophy |

---

## slope (Slope of Peak Exercise ST Segment)

| Value | Meaning |
|---------|----------|
| 0 | Upsloping |
| 1 | Flat |
| 2 | Downsloping |

---

## thal (Thalassemia)

| Value | Meaning |
|---------|----------|
| 0 | Normal |
| 1 | Fixed Defect |
| 2 | Reversible Defect |
| 3 | Unknown (dataset dependent) |

---

## target

| Value | Meaning |
|---------|----------|
| 0 | No Heart Disease |
| 1 | Heart Disease Present |

---

## Recommended Bayesian Network Relationships

Age -> Blood Pressure
Age -> Cholesterol
Sex -> Heart Disease
Chest Pain -> Heart Disease
Blood Pressure -> Heart Disease
Cholesterol -> Heart Disease
Exercise Angina -> Heart Disease
Oldpeak -> Heart Disease
Slope -> Heart Disease
CA -> Heart Disease
Thal -> Heart Disease

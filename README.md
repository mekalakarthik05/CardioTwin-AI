# ❤️ CardioTwin AI

<div align="center">

# Explainable Cardiovascular Risk Intelligence Platform

### Bayesian Networks • XGBoost • SHAP Explainability • Digital Twin Simulation

**Predict. Explain. Simulate. Improve.**

![Python](https://img.shields.io/badge/Python-3.10+-blue?style=for-the-badge&logo=python)
![FastAPI](https://img.shields.io/badge/FastAPI-Backend-green?style=for-the-badge&logo=fastapi)
![React](https://img.shields.io/badge/React-Frontend-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![XGBoost](https://img.shields.io/badge/XGBoost-Ensemble-red?style=for-the-badge)
![SHAP](https://img.shields.io/badge/SHAP-Explainable_AI-purple?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-success?style=for-the-badge)

</div>

---

## 🌟 Overview

CardioTwin AI is an Explainable AI-powered cardiovascular risk assessment platform that combines Bayesian Networks, XGBoost, SHAP Explainability, and Digital Twin Simulation to provide transparent heart disease risk prediction.

---

## 🏗️ System Architecture

```mermaid
flowchart LR

A[Patient Assessment]
--> B[Feature Processing]

B --> C[Bayesian Network]
B --> D[XGBoost Model]

C --> E[Risk Engine]
D --> E

E --> F[SHAP Explainability]
E --> G[Risk Dashboard]
E --> H[PDF Generator]
E --> I[What-If Simulator]
```

## 📂 Project Structure

```text
CardioTwin-AI
│
├── backend/
│
├── frontend/
│
├── model/
│   ├── cardiotwin_bayesian_model.pkl
│   ├── heart_cleaned.csv
│   └── heart_bn_ready.csv
│
├── data/
│   └── heart.csv
│
├── docs/
│   └── data_dictionary.md
│
├── assets/
│   ├── screenshots/
│   └── demo/
│
├── README.md
└── .gitignore
```

## 🚀 Installation

### Clone Repository

```bash
git clone https://github.com/mekalakarthik05/CardioTwin-AI.git

cd CardioTwin-AI
```

### Backend Setup

```bash
cd backend

python -m venv venv

# Windows
venv\Scripts\activate

# Linux / Mac
source venv/bin/activate

pip install -r requirements.txt

uvicorn main:app --reload
```

### Swagger Documentation

```text
http://127.0.0.1:8000/docs
```

### Frontend Setup

```bash
cd frontend

npm install

npm run dev
```

### Frontend URL

```text
http://localhost:5173
```

## 📸 Screenshots

### Landing Page

![Landing Page](assets/screenshots/landing-page.png)

### Assessment Page

![Assessment Page](assets/screenshots/assessment-page.png)

### Results Dashboard

![Results Dashboard](assets/screenshots/results-dashboard.png)

### Explainability Center

![Explainability](assets/screenshots/explainability-page.png)

### Simulator

![Simulator](assets/screenshots/simulator-page.png)

## 🎥 Demo

![Demo](assets/demo/demo.gif)

## 👨‍💻 Author

### Karthik Mekala

Machine Learning • Deep Learning • Generative AI • Explainable AI

GitHub: https://github.com/mekalakarthik05

## ⭐ Support

If you found this project useful, please consider giving the repository a star.

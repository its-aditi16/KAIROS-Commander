import numpy as np
import pandas as pd
from xgboost import XGBClassifier
from sklearn.model_selection import train_test_split

# Singleton model
_model = None

FEATURE_COLUMNS = ['error_rate', 'latency', 'cpu_usage', 'downstream_failures', 'impact_score']

def train_model(force_retrain=False):
    global _model
    if _model is not None and not force_retrain:
        return _model

    if force_retrain:
        print("🔄 Force-retraining ML model...")
        _model = None

    # Generate synthetic dataset
    np.random.seed(42)
    n_samples = 1500

    # Features
    error_rate = np.random.uniform(0, 1, n_samples)
    latency = np.random.uniform(100, 5000, n_samples)
    cpu_usage = np.random.uniform(10, 100, n_samples)
    downstream_failures = np.random.randint(0, 10, n_samples)
    impact_score = np.random.uniform(0, 1, n_samples)

    # Balanced root cause likelihood:
    # Prioritize error_rate (0.5) and impact_score (0.3) for mission-critical awareness
    prob = (error_rate * 0.5 + (latency / 5000) * 0.1 + (cpu_usage / 100) * 0.1 + (downstream_failures / 10) * 0.1 + impact_score * 0.2)
    prob = np.clip(prob, 0, 1)
    # Lower threshold to make the model more sensitive to subtle anomalies (e.g., 6% error rate)
    target = (prob > 0.15).astype(int)

    df = pd.DataFrame({
        'error_rate': error_rate,
        'latency': latency,
        'cpu_usage': cpu_usage,
        'downstream_failures': downstream_failures,
        'impact_score': impact_score,
        'target': target
    })

    X = df[FEATURE_COLUMNS]
    y = df['target']

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    _model = XGBClassifier(n_estimators=100, random_state=42)
    _model.fit(X_train, y_train)

    return _model

def predict_service_probability(features: dict) -> float:
    model = train_model()
    # Normalize and cap features to stay within expected training ranges
    # error_rate: 0-1, latency: 0-5000, cpu_usage: 0-100, downstream_failures: 0-10, impact_score: 0-1
    capped_features = {
        'error_rate': min(1.0, max(0.0, float(features.get('error_rate', 0)))),
        'latency': min(5000.0, max(0.0, float(features.get('latency', 0)))),
        'cpu_usage': min(100.0, max(0.0, float(features.get('cpu_usage', 0)))),
        'downstream_failures': min(10.0, max(0.0, float(features.get('downstream_failures', 0)))),
        'impact_score': min(1.0, max(0.0, float(features.get('impact_score', 0))))
    }
    
    # Ensure features are in the correct order for the model
    input_df = pd.DataFrame([capped_features])[FEATURE_COLUMNS]
    prob = model.predict_proba(input_df)[0][1]  # Probability of positive class
    return float(prob)
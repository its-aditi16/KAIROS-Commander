import numpy as np
import pandas as pd
from xgboost import XGBClassifier
from sklearn.model_selection import train_test_split

# Singleton model
_model = None

def train_model():
    global _model
    if _model is not None:
        return _model

    # Generate synthetic dataset
    np.random.seed(42)
    n_samples = 750

    # Features
    error_rate = np.random.uniform(0, 1, n_samples)
    latency = np.random.uniform(100, 2000, n_samples)
    cpu_usage = np.random.uniform(10, 100, n_samples)
    downstream_failures = np.random.randint(0, 10, n_samples)

    # Simulate root cause likelihood
    # High error_rate + high latency -> high prob
    # High downstream_failures -> high prob
    prob = (error_rate * 0.4 + (latency / 2000) * 0.3 + (cpu_usage / 100) * 0.1 + (downstream_failures / 10) * 0.2)
    prob = np.clip(prob, 0, 1)
    target = (prob > 0.5).astype(int)

    df = pd.DataFrame({
        'error_rate': error_rate,
        'latency': latency,
        'cpu_usage': cpu_usage,
        'downstream_failures': downstream_failures,
        'target': target
    })

    X = df[['error_rate', 'latency', 'cpu_usage', 'downstream_failures']]
    y = df['target']

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    _model = XGBClassifier(n_estimators=100, random_state=42)
    _model.fit(X_train, y_train)

    return _model

def predict_service_probability(features: dict) -> float:
    model = train_model()
    input_df = pd.DataFrame([features])
    prob = model.predict_proba(input_df)[0][1]  # Probability of positive class
    return float(prob)
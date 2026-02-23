import numpy as np
import pandas as pd
from xgboost import XGBClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report

FEATURE_COLUMNS = ['error_rate', 'latency', 'cpu_usage', 'downstream_failures', 'impact_score']

def evaluate():
    # Generate synthetic dataset (exact same logic as ml_model.py)
    np.random.seed(42)
    n_samples = 1500

    error_rate = np.random.uniform(0, 1, n_samples)
    latency = np.random.uniform(100, 5000, n_samples)
    cpu_usage = np.random.uniform(10, 100, n_samples)
    downstream_failures = np.random.randint(0, 10, n_samples)
    impact_score = np.random.uniform(0, 1, n_samples)

    prob = (error_rate * 0.5 + (latency / 5000) * 0.1 + (cpu_usage / 100) * 0.1 + (downstream_failures / 10) * 0.1 + impact_score * 0.2)
    prob = np.clip(prob, 0, 1)
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

    model = XGBClassifier(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    
    print(f"XGBoost Model Accuracy: {accuracy * 100:.2f}%")
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred))

if __name__ == "__main__":
    evaluate()

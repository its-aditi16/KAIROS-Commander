import shap
import pandas as pd
from engines.ml_model import train_model, predict_service_probability

# Singleton explainer
_explainer = None

def get_explainer():
    global _explainer
    if _explainer is not None:
        return _explainer

    model = train_model()
    _explainer = shap.TreeExplainer(model)
    return _explainer

def generate_explainability(service_name: str, features: dict):
    model = train_model()
    explainer = get_explainer()

    input_df = pd.DataFrame([features])
    prob = predict_service_probability(features)

    # Compute SHAP values
    shap_values = explainer.shap_values(input_df)

    # For binary classification, shap_values is list of arrays for each class
    # We take the positive class (index 1)
    if isinstance(shap_values, list):
        shap_vals = shap_values[1][0]  # First (only) instance, positive class
    else:
        shap_vals = shap_values[0]

    feature_names = ['error_rate', 'latency', 'cpu_usage', 'downstream_failures']
    display_names = ['Error Rate', 'Latency', 'CPU Usage', 'Downstream Failures']

    # Create list of (feature, shap_value)
    contributions = list(zip(feature_names, shap_vals))

    # Separate positive and negative
    positive = [(name, val) for name, val in contributions if val > 0]
    negative = [(name, val) for name, val in contributions if val < 0]

    # Sort by absolute value descending
    all_contrib = sorted(contributions, key=lambda x: abs(x[1]), reverse=True)

    # Normalize to percentages
    total_abs = sum(abs(val) for _, val in all_contrib)
    feature_importance = []
    for feat, val in all_contrib:
        impact_percent = (abs(val) / total_abs) * 100 if total_abs > 0 else 0
        direction = "positive" if val > 0 else "negative"
        display_name = display_names[feature_names.index(feat)]
        feature_importance.append({
            "feature": display_name,
            "impact_percent": round(impact_percent, 1),
            "direction": direction
        })

    # Generate summary
    top_features = feature_importance[:2]  # Top 2
    summary_parts = []
    for feat in top_features:
        key = feature_names[display_names.index(feat['feature'])]
        if feat['direction'] == 'positive':
            summary_parts.append(f"elevated {feat['feature'].lower()} ({features[key]:.2f})")
        else:
            summary_parts.append(f"low {feat['feature'].lower()} ({features[key]:.2f})")

    summary = f"The {service_name} shows {' and '.join(summary_parts)}. SHAP analysis indicates that {', '.join([f['feature'].lower() for f in top_features])} are the dominant contributors to the predicted root cause."

    return {
        "top_suspect": service_name,
        "confidence": int(prob * 100),
        "summary": summary,
        "feature_importance": feature_importance
    }

if __name__ == "__main__":
    test_input = {
        "error_rate": 0.7,
        "latency": 1400,
        "cpu_usage": 75,
        "downstream_failures": 2
    }
    print(generate_explainability("Payment Gateway", test_input))
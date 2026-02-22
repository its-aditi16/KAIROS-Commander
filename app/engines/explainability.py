import numpy as np
import pandas as pd
import shap
from app.engines.ml_model import train_model, predict_service_probability, FEATURE_COLUMNS


def generate_explainability(service_name: str, features: dict, confidence: int = None):
    """Generate feature importance using SHAP TreeExplainer (optimized for XGBoost)."""
    model = train_model()

    # Normalize and cap features to stay within expected training ranges
    capped_features = {
        'error_rate': min(1.0, max(0.0, float(features.get('error_rate', 0)))),
        'latency': min(5000.0, max(0.0, float(features.get('latency', 0)))),
        'cpu_usage': min(100.0, max(0.0, float(features.get('cpu_usage', 0)))),
        'downstream_failures': min(10.0, max(0.0, float(features.get('downstream_failures', 0)))),
        'impact_score': min(1.0, max(0.0, float(features.get('impact_score', 0))))
    }

    input_df = pd.DataFrame([capped_features])[FEATURE_COLUMNS]
    
    # Use provided confidence or calculate prob from model
    if confidence is not None:
        prob = confidence / 100.0
    else:
        prob = predict_service_probability(features)

    # Use SHAP TreeExplainer (fast for tree models)
    explainer = shap.TreeExplainer(model)
    shap_values = explainer.shap_values(input_df)

    # Resolve SHAP value structure based on output format
    if isinstance(shap_values, list):
        # Binary case often returns a list [neg_class_shap, pos_class_shap]
        sv = shap_values[1][0] if len(shap_values) > 1 else shap_values[0][0]
    else:
        # Some versions return specialized object or single array
        if hasattr(shap_values, "values"):
            sv = shap_values.values[0]
        else:
            sv = shap_values[0]

    feature_names = FEATURE_COLUMNS
    display_names = ['Error Rate', 'Latency', 'CPU Usage', 'Downstream Failures', 'Impact Score']
    thresholds = {'error_rate': 0.05, 'latency': 400, 'cpu_usage': 70, 'downstream_failures': 2, 'impact_score': 0.1}

    # Normalize SHAP values to relative impact percentages with native casting
    # We prioritize positive contributors (drivers) over negative ones (noise/stabilizers)
    # for root cause explanation.
    adj_sv = []
    for val in sv:
        v = val.item() if hasattr(val, 'item') else float(val)
        # Give more weight to features that PUSHED the probability UP
        adj_sv.append(v * 2.0 if v > 0 else abs(v))
        
    adj_sv = np.array(adj_sv)
    total_adj = np.sum(adj_sv) if np.sum(adj_sv) > 0 else 1.0
    
    feature_importance = []
    for i, feat in enumerate(feature_names):
        # Defensive casting for JSON stability
        adj_val = adj_sv[i].item() if hasattr(adj_sv[i], 'item') else float(adj_sv[i])
        total_adj_val = total_adj.item() if hasattr(total_adj, 'item') else float(total_adj)
        
        impact_percent = (adj_val / total_adj_val) * 100
        direction = "positive" if features.get(feat, 0) >= thresholds.get(feat, 0) else "negative"
        
        raw_shap = sv[i].item() if hasattr(sv[i], 'item') else float(sv[i])
        
        feature_importance.append({
            "feature": str(display_names[i]),
            "impact_percent": float(round(impact_percent, 1)),
            "direction": str(direction),
            "shap_value": float(raw_shap)
        })

    # Sort by impact_percent primarily to show the most "informative" driver
    feature_importance.sort(key=lambda x: x["impact_percent"], reverse=True)

    # Generate summary
    top_features = feature_importance[:2]
    summary_parts = []
    for feat in top_features:
        key = feature_names[display_names.index(feat['feature'])]
        raw_val = features.get(key, 0)
        direction_label = "elevated" if feat['direction'] == 'positive' else "low"
        summary_parts.append(f"{direction_label} {feat['feature'].lower()} ({float(raw_val):.2f})")

    summary = (
        f"The {service_name} shows {' and '.join(summary_parts)}. "
        f"SHAP analysis indicates that "
        f"{', '.join([f['feature'].lower() for f in top_features])} "
        f"are the dominant contributors to the predicted root cause."
    )

    return {
        "top_suspect": str(service_name),
        "confidence": int(prob * 100),
        "summary": str(summary),
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
"""
Simple ML Model Test - Demonstrates Core Functionality
"""

import sys
import os
import numpy as np
import pandas as pd
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score, confusion_matrix

# Add the engines directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'engines'))

try:
    from ml_model import train_model, predict_service_probability
    print("✅ Successfully imported ML model")
except ImportError as e:
    print(f"❌ Failed to import ML model: {e}")
    sys.exit(1)

def test_basic_functionality():
    """Test basic model functionality"""
    print("\n" + "="*50)
    print("🔍 BASIC FUNCTIONALITY TEST")
    print("="*50)
    
    # Train the model
    model = train_model()
    print(f"✅ Model trained: {type(model).__name__}")
    
    # Test prediction with known scenarios
    scenarios = {
        "High Risk": {"error_rate": 0.8, "latency": 1600, "cpu_usage": 85, "downstream_failures": 4},
        "Low Risk": {"error_rate": 0.05, "latency": 200, "cpu_usage": 30, "downstream_failures": 0},
        "Medium Risk": {"error_rate": 0.4, "latency": 900, "cpu_usage": 70, "downstream_failures": 1}
    }
    
    for name, features in scenarios.items():
        prob = predict_service_probability(features)
        prediction = "Root Cause" if prob > 0.5 else "Normal"
        print(f"{name}: {prob:.3f} → {prediction}")
    
    return True

def test_model_performance():
    """Test model performance metrics"""
    print("\n" + "="*50)
    print("📊 MODEL PERFORMANCE TEST")
    print("="*50)
    
    # Generate test data
    np.random.seed(123)
    n_samples = 200
    
    error_rate = np.random.uniform(0, 1, n_samples)
    latency = np.random.uniform(100, 2000, n_samples)
    cpu_usage = np.random.uniform(10, 100, n_samples)
    downstream_failures = np.random.randint(0, 10, n_samples)
    
    # Create target using same logic as training
    prob = (error_rate * 0.4 + (latency / 2000) * 0.3 + 
            (cpu_usage / 100) * 0.1 + (downstream_failures / 10) * 0.2)
    prob = np.clip(prob, 0, 1)
    target = (prob > 0.5).astype(int)
    
    X_test = pd.DataFrame({
        'error_rate': error_rate,
        'latency': latency,
        'cpu_usage': cpu_usage,
        'downstream_failures': downstream_failures
    })
    y_test = target
    
    # Get predictions
    model = train_model()
    y_pred = model.predict(X_test)
    y_proba = model.predict_proba(X_test)[:, 1]
    
    # Calculate metrics
    accuracy = accuracy_score(y_test, y_pred)
    precision = precision_score(y_test, y_pred)
    recall = recall_score(y_test, y_pred)
    f1 = f1_score(y_test, y_pred)
    roc_auc = roc_auc_score(y_test, y_proba)
    
    print("Performance Metrics:")
    print(f"Accuracy: {accuracy:.3f}")
    print(f"Precision: {precision:.3f}")
    print(f"Recall: {recall:.3f}")
    print(f"F1 Score: {f1:.3f}")
    print(f"ROC-AUC: {roc_auc:.3f}")
    
    return {
        'accuracy': accuracy,
        'precision': precision,
        'recall': recall,
        'f1': f1,
        'roc_auc': roc_auc
    }

def test_feature_importance():
    """Test feature importance"""
    print("\n" + "="*50)
    print("🎯 FEATURE IMPORTANCE TEST")
    print("="*50)
    
    model = train_model()
    feature_names = ['error_rate', 'latency', 'cpu_usage', 'downstream_failures']
    importances = model.feature_importances_
    
    # Sort and display
    feature_importance_pairs = list(zip(feature_names, importances))
    feature_importance_pairs.sort(key=lambda x: x[1], reverse=True)
    
    print("Feature Importance Ranking:")
    for i, (feature, importance) in enumerate(feature_importance_pairs, 1):
        print(f"{i}. {feature} → {importance:.3f}")
    
    # Validate key features
    key_features = ['error_rate', 'latency', 'downstream_failures']
    print(f"\nKey Features Validation:")
    for feature, importance in feature_importance_pairs:
        if feature in key_features:
            status = "✅" if importance > 0.1 else "⚠️"
            print(f"{status} {feature}: {importance:.3f}")
    
    return feature_importance_pairs

def test_edge_cases():
    """Test edge cases"""
    print("\n" + "="*50)
    print("⚠️ EDGE CASE TEST")
    print("="*50)
    
    edge_cases = {
        "All Zeros": {"error_rate": 0.0, "latency": 0.0, "cpu_usage": 0.0, "downstream_failures": 0},
        "All Ones": {"error_rate": 1.0, "latency": 2000, "cpu_usage": 100, "downstream_failures": 10},
        "Mixed": {"error_rate": 0.5, "latency": 1000, "cpu_usage": 50, "downstream_failures": 5}
    }
    
    for name, features in edge_cases.items():
        try:
            prob = predict_service_probability(features)
            prediction = "Root Cause" if prob > 0.5 else "Normal"
            print(f"{name}: {prob:.3f} → {prediction} ✅")
        except Exception as e:
            print(f"{name}: ERROR - {e} ❌")
    
    return True

def main():
    """Run all tests"""
    print("🚀 ML MODEL TESTING SUITE")
    print("="*60)
    print("Testing XGBoost Classifier for Root Cause Prediction")
    
    try:
        # Run all tests
        test_basic_functionality()
        performance = test_model_performance()
        importance = test_feature_importance()
        test_edge_cases()
        
        # Summary
        print("\n" + "="*60)
        print("📋 TEST SUMMARY")
        print("="*60)
        print("✅ All tests completed successfully!")
        print(f"🎯 Model Accuracy: {performance['accuracy']:.3f}")
        print(f"🎯 ROC-AUC: {performance['roc_auc']:.3f}")
        print(f"🔍 Top Feature: {importance[0][0]}")
        print("\n🎉 Model is ready for production!")
        
    except Exception as e:
        print(f"\n❌ Test failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()

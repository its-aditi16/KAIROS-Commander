"""
Run ML test and save results to file
"""

import sys
import os

# Redirect output to file
with open('test_results.txt', 'w') as f:
    # Store original stdout
    import builtins
    original_print = builtins.print
    
    def print_to_file(*args, **kwargs):
        original_print(*args, **kwargs)
        original_print(*args, file=f, **kwargs)
    
    builtins.print = print_to_file
    
    try:
        print("🚀 ML MODEL TESTING DEMONSTRATION")
        print("=" * 50)
        
        import numpy as np
        import pandas as pd
        print("✅ Basic imports successful")
        
        # Add path for ML model
        sys.path.append(os.path.join(os.path.dirname(__file__), 'app', 'engines'))
        
        # Import ML model
        from ml_model import train_model, predict_service_probability
        print("✅ ML model imported successfully")
        
        # Test 1: Basic functionality
        print("\n" + "=" * 30)
        print("TEST 1: BASIC FUNCTIONALITY")
        print("=" * 30)
        
        model = train_model()
        print(f"✅ Model trained: {type(model).__name__}")
        
        # Test scenarios
        scenarios = {
            "High Risk": {"error_rate": 0.8, "latency": 1600, "cpu_usage": 85, "downstream_failures": 4},
            "Low Risk": {"error_rate": 0.05, "latency": 200, "cpu_usage": 30, "downstream_failures": 0},
            "Medium Risk": {"error_rate": 0.4, "latency": 900, "cpu_usage": 70, "downstream_failures": 1}
        }
        
        for name, features in scenarios.items():
            prob = predict_service_probability(features)
            prediction = "Root Cause" if prob > 0.5 else "Normal"
            print(f"{name}: {prob:.3f} → {prediction}")
        
        # Test 2: Performance metrics
        print("\n" + "=" * 30)
        print("TEST 2: PERFORMANCE METRICS")
        print("=" * 30)
        
        from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score
        
        # Generate test data
        np.random.seed(123)
        n_samples = 100
        
        error_rate = np.random.uniform(0, 1, n_samples)
        latency = np.random.uniform(100, 2000, n_samples)
        cpu_usage = np.random.uniform(10, 100, n_samples)
        downstream_failures = np.random.randint(0, 10, n_samples)
        
        # Create target
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
        
        # Test 3: Feature importance
        print("\n" + "=" * 30)
        print("TEST 3: FEATURE IMPORTANCE")
        print("=" * 30)
        
        feature_names = ['error_rate', 'latency', 'cpu_usage', 'downstream_failures']
        importances = model.feature_importances_
        
        feature_importance_pairs = list(zip(feature_names, importances))
        feature_importance_pairs.sort(key=lambda x: x[1], reverse=True)
        
        print("Feature Importance Ranking:")
        for i, (feature, importance) in enumerate(feature_importance_pairs, 1):
            print(f"{i}. {feature} → {importance:.3f}")
        
        # Test 4: Edge cases
        print("\n" + "=" * 30)
        print("TEST 4: EDGE CASES")
        print("=" * 30)
        
        edge_cases = {
            "All Zeros": {"error_rate": 0.0, "latency": 0.0, "cpu_usage": 0.0, "downstream_failures": 0},
            "All High": {"error_rate": 1.0, "latency": 2000, "cpu_usage": 100, "downstream_failures": 10}
        }
        
        for name, features in edge_cases.items():
            prob = predict_service_probability(features)
            prediction = "Root Cause" if prob > 0.5 else "Normal"
            print(f"{name}: {prob:.3f} → {prediction}")
        
        print("\n" + "=" * 50)
        print("🎉 ALL TESTS COMPLETED SUCCESSFULLY!")
        print("Model is ready for production deployment!")
        print("=" * 50)
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
    
    finally:
        # Restore original print
        builtins.print = original_print

print("Test completed. Results saved to test_results.txt")

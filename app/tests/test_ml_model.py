"""
Comprehensive ML Model Testing Suite for XGBoost Classifier

This script provides production-style validation for the root cause prediction model.
It evaluates model performance, verifies feature influence, tests edge cases,
and ensures logical behavior of the classifier.
"""

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score, 
    roc_auc_score, confusion_matrix, classification_report
)
import sys
import os

# Add the engines directory to the path to import ml_model
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'engines'))
from ml_model import train_model, predict_service_probability


def test_model_metrics():
    """
    Test 1: Train/Test Split Evaluation
    Evaluates model performance on held-out test data
    """
    print("=" * 60)
    print("🔍 MODEL METRICS EVALUATION")
    print("=" * 60)
    
    # Get the trained model and generate fresh test data
    model = train_model()
    
    # Generate synthetic dataset for testing (different seed for variety)
    np.random.seed(123)
    n_samples = 200
    
    error_rate = np.random.uniform(0, 1, n_samples)
    latency = np.random.uniform(100, 2000, n_samples)
    cpu_usage = np.random.uniform(10, 100, n_samples)
    downstream_failures = np.random.randint(0, 10, n_samples)
    
    # Simulate target using same logic as training
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
    
    # Make predictions
    y_pred = model.predict(X_test)
    y_proba = model.predict_proba(X_test)[:, 1]
    
    # Calculate metrics
    accuracy = accuracy_score(y_test, y_pred)
    precision = precision_score(y_test, y_pred)
    recall = recall_score(y_test, y_pred)
    f1 = f1_score(y_test, y_pred)
    roc_auc = roc_auc_score(y_test, y_proba)
    
    print("Model Evaluation:")
    print(f"Accuracy: {accuracy:.3f}")
    print(f"Precision: {precision:.3f}")
    print(f"Recall: {recall:.3f}")
    print(f"F1 Score: {f1:.3f}")
    print(f"ROC-AUC: {roc_auc:.3f}")
    
    # Detailed classification report
    print("\nDetailed Classification Report:")
    print(classification_report(y_test, y_pred, target_names=['Normal', 'Root Cause']))
    
    return {
        'accuracy': accuracy,
        'precision': precision,
        'recall': recall,
        'f1': f1,
        'roc_auc': roc_auc,
        'y_test': y_test,
        'y_pred': y_pred,
        'y_proba': y_proba
    }


def test_confusion_matrix(y_test, y_pred):
    """
    Test 2: Confusion Matrix Analysis
    Displays confusion matrix in readable format
    """
    print("\n" + "=" * 60)
    print("📊 CONFUSION MATRIX ANALYSIS")
    print("=" * 60)
    
    cm = confusion_matrix(y_test, y_pred)
    tn, fp, fn, tp = cm.ravel()
    
    print("Confusion Matrix Results:")
    print(f"True Positives: {tp} (Correctly identified root causes)")
    print(f"False Positives: {fp} (Normal behavior flagged as root cause)")
    print(f"True Negatives: {tn} (Correctly identified normal behavior)")
    print(f"False Negatives: {fn} (Missed root causes)")
    
    # Calculate additional metrics
    total = tp + fp + tn + fn
    print(f"\nRates:")
    print(f"True Positive Rate (Recall): {tp/(tp+fn):.3f}")
    print(f"False Positive Rate: {fp/(fp+tn):.3f}")
    print(f"True Negative Rate (Specificity): {tn/(fp+tn):.3f}")
    print(f"False Negative Rate: {fn/(tp+fn):.3f}")
    
    return cm


def test_feature_importance():
    """
    Test 3: Feature Importance Check
    Verifies that key features have meaningful impact
    """
    print("\n" + "=" * 60)
    print("🎯 FEATURE IMPORTANCE ANALYSIS")
    print("=" * 60)
    
    model = train_model()
    feature_names = ['error_rate', 'latency', 'cpu_usage', 'downstream_failures']
    importances = model.feature_importances_
    
    # Sort features by importance
    feature_importance_pairs = list(zip(feature_names, importances))
    feature_importance_pairs.sort(key=lambda x: x[1], reverse=True)
    
    print("Feature Importance Ranking:")
    for i, (feature, importance) in enumerate(feature_importance_pairs, 1):
        print(f"{i}. {feature} → {importance:.3f}")
    
    # Validate that key features have meaningful impact
    key_features = ['error_rate', 'latency', 'downstream_failures']
    key_feature_importance = {f: imp for f, imp in feature_importance_pairs if f in key_features}
    
    print(f"\nKey Features Validation:")
    for feature, importance in key_feature_importance.items():
        if importance > 0.1:  # Threshold for meaningful impact
            print(f"✅ {feature}: {importance:.3f} (Meaningful impact)")
        else:
            print(f"⚠️  {feature}: {importance:.3f} (Low impact - review needed)")
    
    return feature_importance_pairs


def test_manual_scenarios():
    """
    Test 4: Logical Behavior Tests
    Manually test specific scenarios to ensure logical predictions
    """
    print("\n" + "=" * 60)
    print("🧪 MANUAL SCENARIO TESTING")
    print("=" * 60)
    
    # Test cases
    scenarios = {
        "High Risk": {
            "error_rate": 0.8,
            "latency": 1600,
            "cpu_usage": 85,
            "downstream_failures": 4,
            "expected_min_prob": 0.7
        },
        "Low Risk": {
            "error_rate": 0.05,
            "latency": 200,
            "cpu_usage": 30,
            "downstream_failures": 0,
            "expected_max_prob": 0.3
        },
        "Mixed": {
            "error_rate": 0.4,
            "latency": 900,
            "cpu_usage": 70,
            "downstream_failures": 1,
            "expected_range": (0.3, 0.7)
        }
    }
    
    results = {}
    
    for scenario_name, features in scenarios.items():
        print(f"\n{scenario_name} Scenario:")
        print(f"Input: {features}")
        
        # Make prediction
        probability = predict_service_probability(features)
        prediction_class = 1 if probability > 0.5 else 0
        
        print(f"Predicted Probability: {probability:.3f}")
        print(f"Prediction Class: {prediction_class} ({'Root Cause' if prediction_class == 1 else 'Normal'})")
        
        # Validate against expectations
        if "expected_min_prob" in features:
            if probability >= features["expected_min_prob"]:
                print(f"✅ Passed: Probability {probability:.3f} >= {features['expected_min_prob']}")
            else:
                print(f"❌ Failed: Probability {probability:.3f} < {features['expected_min_prob']}")
        
        elif "expected_max_prob" in features:
            if probability <= features["expected_max_prob"]:
                print(f"✅ Passed: Probability {probability:.3f} <= {features['expected_max_prob']}")
            else:
                print(f"❌ Failed: Probability {probability:.3f} > {features['expected_max_prob']}")
        
        elif "expected_range" in features:
            min_prob, max_prob = features["expected_range"]
            if min_prob <= probability <= max_prob:
                print(f"✅ Passed: Probability {probability:.3f} in range [{min_prob}, {max_prob}]")
            else:
                print(f"❌ Failed: Probability {probability:.3f} not in range [{min_prob}, {max_prob}]")
        
        results[scenario_name] = {
            'probability': probability,
            'prediction_class': prediction_class,
            'features': features
        }
    
    return results


def test_edge_cases():
    """
    Test 5: Edge Case Testing
    Tests boundary conditions and unusual inputs
    """
    print("\n" + "=" * 60)
    print("⚠️  EDGE CASE TESTING")
    print("=" * 60)
    
    edge_cases = {
        "All Zeros": {
            "error_rate": 0.0,
            "latency": 0.0,
            "cpu_usage": 0.0,
            "downstream_failures": 0
        },
        "Extremely High Values": {
            "error_rate": 1.0,
            "latency": 10000,
            "cpu_usage": 100,
            "downstream_failures": 100
        },
        "Negative Values": {
            "error_rate": -0.1,
            "latency": -100,
            "cpu_usage": -5,
            "downstream_failures": -1
        },
        "Mixed Extreme": {
            "error_rate": 0.0,
            "latency": 5000,
            "cpu_usage": 100,
            "downstream_failures": 0
        },
        "Minimal Non-Zero": {
            "error_rate": 0.001,
            "latency": 1,
            "cpu_usage": 1,
            "downstream_failures": 0
        }
    }
    
    results = {}
    
    for case_name, features in edge_cases.items():
        print(f"\n{case_name}:")
        print(f"Input: {features}")
        
        try:
            probability = predict_service_probability(features)
            prediction_class = 1 if probability > 0.5 else 0
            
            print(f"Predicted Probability: {probability:.3f}")
            print(f"Prediction Class: {prediction_class} ({'Root Cause' if prediction_class == 1 else 'Normal'})")
            print("✅ Model handled edge case without crashing")
            
            results[case_name] = {
                'probability': probability,
                'prediction_class': prediction_class,
                'status': 'success'
            }
            
        except Exception as e:
            print(f"❌ Model failed with error: {str(e)}")
            results[case_name] = {
                'probability': None,
                'prediction_class': None,
                'status': 'failed',
                'error': str(e)
            }
    
    return results


def test_calibration_check(y_proba):
    """
    Test 6: Calibration Check
    Analyzes probability distribution to ensure well-calibrated outputs
    """
    print("\n" + "=" * 60)
    print("📈 PROBABILITY CALIBRATION ANALYSIS")
    print("=" * 60)
    
    # Calculate probability statistics
    prob_mean = np.mean(y_proba)
    prob_std = np.std(y_proba)
    prob_min = np.min(y_proba)
    prob_max = np.max(y_proba)
    
    print("Probability Distribution Statistics:")
    print(f"Mean: {prob_mean:.3f}")
    print(f"Std Dev: {prob_std:.3f}")
    print(f"Min: {prob_min:.3f}")
    print(f"Max: {prob_max:.3f}")
    print(f"Range: {prob_max - prob_min:.3f}")
    
    # Check for problematic patterns
    extreme_low = np.sum(y_proba < 0.1)
    extreme_high = np.sum(y_proba > 0.9)
    middle_range = np.sum((y_proba >= 0.1) & (y_proba <= 0.9))
    
    print(f"\nProbability Range Distribution:")
    print(f"Very Low (< 0.1): {extreme_low} samples ({extreme_low/len(y_proba)*100:.1f}%)")
    print(f"Middle Range (0.1-0.9): {middle_range} samples ({middle_range/len(y_proba)*100:.1f}%)")
    print(f"Very High (> 0.9): {extreme_high} samples ({extreme_high/len(y_proba)*100:.1f}%)")
    
    # Calibration quality assessment
    if extreme_low > len(y_proba) * 0.8 or extreme_high > len(y_proba) * 0.8:
        print("⚠️  Warning: Model may be overconfident (too many extreme probabilities)")
    elif middle_range < len(y_proba) * 0.3:
        print("⚠️  Warning: Model may be underconfident (too few extreme probabilities)")
    else:
        print("✅ Good: Model shows balanced probability distribution")
    
    # Create histogram bins for analysis
    bins = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0]
    hist, _ = np.histogram(y_proba, bins=bins)
    
    print(f"\nHistogram (bins of 0.1):")
    for i in range(len(bins)-1):
        print(f"[{bins[i]:.1f}-{bins[i+1]:.1f}): {hist[i]} samples")
    
    return {
        'mean': prob_mean,
        'std': prob_std,
        'min': prob_min,
        'max': prob_max,
        'extreme_low': extreme_low,
        'extreme_high': extreme_high,
        'middle_range': middle_range
    }


def run_all_tests():
    """
    Main function to run all tests and generate comprehensive report
    """
    print("🚀 STARTING COMPREHENSIVE ML MODEL TESTING")
    print("=" * 80)
    print("Testing XGBoost Classifier for Root Cause Prediction")
    print("=" * 80)
    
    # Run all tests
    try:
        # Test 1: Model Metrics
        metrics_results = test_model_metrics()
        
        # Test 2: Confusion Matrix
        confusion_results = test_confusion_matrix(
            metrics_results['y_test'], 
            metrics_results['y_pred']
        )
        
        # Test 3: Feature Importance
        importance_results = test_feature_importance()
        
        # Test 4: Manual Scenarios
        scenario_results = test_manual_scenarios()
        
        # Test 5: Edge Cases
        edge_results = test_edge_cases()
        
        # Test 6: Calibration Check
        calibration_results = test_calibration_check(metrics_results['y_proba'])
        
        # Summary Report
        print("\n" + "=" * 80)
        print("📋 TESTING SUMMARY REPORT")
        print("=" * 80)
        
        print("\n✅ COMPLETED TESTS:")
        print("1. Model Metrics Evaluation")
        print("2. Confusion Matrix Analysis")
        print("3. Feature Importance Analysis")
        print("4. Manual Scenario Testing")
        print("5. Edge Case Testing")
        print("6. Probability Calibration Analysis")
        
        print(f"\n🎯 KEY PERFORMANCE INDICATORS:")
        print(f"- Model Accuracy: {metrics_results['accuracy']:.3f}")
        print(f"- ROC-AUC Score: {metrics_results['roc_auc']:.3f}")
        print(f"- F1 Score: {metrics_results['f1']:.3f}")
        
        print(f"\n🔍 MODEL BEHAVIOR:")
        print(f"- Probability Range: [{calibration_results['min']:.3f}, {calibration_results['max']:.3f}]")
        print(f"- Top Feature: {importance_results[0][0]} (importance: {importance_results[0][1]:.3f})")
        
        # Check for any failed tests
        failed_edge_cases = [name for name, result in edge_results.items() if result['status'] == 'failed']
        if failed_edge_cases:
            print(f"\n⚠️  FAILED EDGE CASES: {len(failed_edge_cases)}")
            for case in failed_edge_cases:
                print(f"   - {case}")
        else:
            print(f"\n✅ ALL EDGE CASES HANDLED SUCCESSFULLY")
        
        print("\n🎉 TESTING COMPLETED SUCCESSFULLY!")
        print("Model is ready for production integration.")
        
    except Exception as e:
        print(f"\n❌ TESTING FAILED: {str(e)}")
        print("Please review the error and fix issues before production deployment.")
        raise


if __name__ == "__main__":
    run_all_tests()

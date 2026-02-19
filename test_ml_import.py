"""
Test ML model import and basic functionality
"""

import sys
import os

print("Testing ML Model Import...")
print("=" * 40)

# Add path
sys.path.append(os.path.join(os.path.dirname(__file__), 'app', 'engines'))

try:
    print("1. Testing basic import...")
    from ml_model import train_model, predict_service_probability
    print("✅ Import successful")
    
    print("\n2. Testing model training...")
    model = train_model()
    print(f"✅ Model trained: {type(model).__name__}")
    
    print("\n3. Testing prediction...")
    test_features = {
        "error_rate": 0.8,
        "latency": 1600,
        "cpu_usage": 85,
        "downstream_failures": 4
    }
    
    prob = predict_service_probability(test_features)
    print(f"✅ Prediction successful: {prob:.3f}")
    
    print("\n4. Testing with different features...")
    test_features2 = {
        "error_rate": 0.05,
        "latency": 200,
        "cpu_usage": 30,
        "downstream_failures": 0
    }
    
    prob2 = predict_service_probability(test_features2)
    print(f"✅ Second prediction successful: {prob2:.3f}")
    
    print("\n🎉 All ML model tests passed!")
    
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()

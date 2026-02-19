# Quick ML Model Demo
import sys
import os
sys.path.append('app/engines')

print("🚀 ML MODEL DEMONSTRATION")
print("=" * 40)

try:
    from ml_model import train_model, predict_service_probability
    print("✅ Model imported successfully")
    
    # Train model
    model = train_model()
    print(f"✅ Model trained: {type(model).__name__}")
    
    # Test predictions
    print("\n📊 PREDICTION TESTS:")
    print("-" * 25)
    
    test_cases = [
        ("High Risk", {"error_rate": 0.8, "latency": 1600, "cpu_usage": 85, "downstream_failures": 4}),
        ("Low Risk", {"error_rate": 0.05, "latency": 200, "cpu_usage": 30, "downstream_failures": 0}),
        ("Medium Risk", {"error_rate": 0.4, "latency": 900, "cpu_usage": 70, "downstream_failures": 1})
    ]
    
    for name, features in test_cases:
        prob = predict_service_probability(features)
        result = "ROOT CAUSE" if prob > 0.5 else "NORMAL"
        print(f"{name}: {prob:.3f} → {result}")
    
    # Feature importance
    print("\n🎯 FEATURE IMPORTANCE:")
    print("-" * 25)
    feature_names = ['error_rate', 'latency', 'cpu_usage', 'downstream_failures']
    importances = model.feature_importances_
    
    for i, (name, imp) in enumerate(zip(feature_names, importances), 1):
        print(f"{i}. {name}: {imp:.3f}")
    
    print("\n🎉 DEMO COMPLETED SUCCESSFULLY!")
    print("Model is ready for production!")
    
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()

#!/usr/bin/env python3
"""
Simple test runner to debug the ML model testing
"""

import sys
import os

print("Starting ML model test...")
print(f"Python executable: {sys.executable}")
print(f"Python version: {sys.version}")
print(f"Current working directory: {os.getcwd()}")

try:
    # Add the engines directory to the path
    engines_path = os.path.join(os.path.dirname(__file__), 'app', 'engines')
    print(f"Adding to path: {engines_path}")
    sys.path.append(engines_path)
    
    # Import the ML model
    print("Importing ml_model...")
    from ml_model import train_model, predict_service_probability
    print("✅ Successfully imported ml_model")
    
    # Test basic functionality
    print("Training model...")
    model = train_model()
    print(f"✅ Model trained successfully: {type(model).__name__}")
    
    # Test prediction
    test_features = {'error_rate': 0.8, 'latency': 1600, 'cpu_usage': 85, 'downstream_failures': 4}
    print(f"Testing prediction with features: {test_features}")
    prob = predict_service_probability(test_features)
    print(f"✅ Prediction successful: {prob:.3f}")
    
    # Now run the comprehensive test
    print("\n" + "="*50)
    print("Running comprehensive test suite...")
    
    # Import and run the test
    test_path = os.path.join(os.path.dirname(__file__), 'app', 'tests', 'test_ml_model.py')
    print(f"Running test file: {test_path}")
    
    # Read and execute the test file
    with open(test_path, 'r') as f:
        test_code = f.read()
    
    # Execute the test code
    exec(test_code)
    
except Exception as e:
    print(f"❌ Error occurred: {e}")
    import traceback
    traceback.print_exc()

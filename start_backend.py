#!/usr/bin/env python3
"""
Backend startup script with error handling
"""

import sys
import os

print("🚀 Starting ML Model Backend...")
print("=" * 50)

try:
    # Check dependencies
    print("Checking dependencies...")
    import fastapi
    import uvicorn
    print("✅ FastAPI and Uvicorn available")
    
    # Check ML model
    sys.path.append(os.path.join(os.path.dirname(__file__), 'app', 'engines'))
    from ml_model import train_model
    print("✅ ML model available")
    
    # Test model training
    print("Testing ML model...")
    model = train_model()
    print(f"✅ Model trained: {type(model).__name__}")
    
    # Start the server
    print("\nStarting FastAPI server...")
    print("Server will be available at: http://localhost:8000")
    print("API docs at: http://localhost:8000/docs")
    print("\nPress Ctrl+C to stop the server")
    print("=" * 50)
    
    # Import and run the app
    from app.main import app
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
    
except ImportError as e:
    print(f"❌ Missing dependency: {e}")
    print("\nInstall required packages:")
    print("pip install fastapi uvicorn numpy pandas scikit-learn xgboost")
    sys.exit(1)
    
except Exception as e:
    print(f"❌ Error starting backend: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

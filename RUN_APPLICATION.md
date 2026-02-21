# 🚀 How to Run the ML Model Application

## 📋 Prerequisites

Make sure you have these installed:
- **Python 3.8+** with required packages
- **Node.js 16+** and npm
- **Required Python packages**: `fastapi`, `uvicorn`, `numpy`, `pandas`, `scikit-learn`, `xgboost`

## 🏃‍♂️ Quick Start Guide

### Step 1: Start the Backend (ML Model API)

Open **Terminal 1** and run:
```bash
cd "c:\Users\ADITI CHAUHAN\OneDrive\Desktop\commander_ai"
python app/main.py
```

**Expected Output:**
```
INFO:     Started server process [12345]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000
```

### Step 2: Start the Frontend (React Application)

Open **Terminal 2** and run:
```bash
cd "c:\Users\ADITI CHAUHAN\OneDrive\Desktop\commander_ai"
npm run dev
```

**Expected Output:**
```
  VITE v4.x.x  ready in 1234 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.x.x:5173/
```

### Step 3: Access the Application

Open your browser and go to: **http://localhost:5173**

## 🎯 What You'll See

### Frontend Dashboard
- **Incident Overview** with real-time metrics
- **Service Graph** showing system dependencies
- **Risk Ranking** with ML probability scores
- **Root Cause Panel** displaying ML predictions
- **Hypothesis Board** with AI-generated insights

### Backend API
- **ML Model Endpoint**: `http://localhost:8000/incident/analyze`
- **Real-time predictions** from your XGBoost model
- **Feature importance** and confidence scores

## 🔧 Testing the ML Model

### Option 1: Quick ML Test
```bash
cd "c:\Users\ADITI CHAUHAN\OneDrive\Desktop\commander_ai"
python quick_demo.py
```

### Option 2: Full ML Test Suite
```bash
cd "c:\Users\ADITI CHAUHAN\OneDrive\Desktop\commander_ai"
python app/tests/simple_ml_test.py
```

### Option 3: Windows Batch File
```bash
cd "c:\Users\ADITI CHAUHAN\OneDrive\Desktop\commander_ai"
run_ml_test.bat
```

## 📊 API Testing

You can test the ML model directly via API:

### Using curl:
```bash
curl -X POST "http://localhost:8000/incident/analyze" \
-H "Content-Type: application/json" \
-d '{
  "services": {
    "payment-service": {
      "error_rate": 0.8,
      "latency": 1600,
      "cpu_usage": 85,
      "downstream_failures": 4
    },
    "auth-service": {
      "error_rate": 0.05,
      "latency": 200,
      "cpu_usage": 30,
      "downstream_failures": 0
    }
  }
}'
```

### Expected API Response:
```json
{
  "ai_hypotheses": [
    {"service": "payment-service", "confidence": 87},
    {"service": "auth-service", "confidence": 12}
  ],
  "root_cause_analysis": {
    "topPrediction": "payment-service",
    "confidence": 87,
    "explanation": "High error rate and latency indicate...",
    "shapValues": [
      {"feature": "error_rate", "value": 0.45},
      {"feature": "latency", "value": 0.31}
    ]
  }
}
```

## 🛠️ Troubleshooting

### Backend Issues:
```bash
# Check Python dependencies
pip install fastapi uvicorn numpy pandas scikit-learn xgboost

# Check if backend is running
curl http://localhost:8000/docs
```

### Frontend Issues:
```bash
# Install Node dependencies
npm install

# Clear cache
npm run build
npm run dev
```

### Port Conflicts:
- **Backend**: Port 8000 (change in `app/main.py`)
- **Frontend**: Port 5173 (change with `npm run dev -- --port 3000`)

## 🎮 Application Flow

1. **Frontend loads** → Shows dashboard with mock data
2. **User triggers analysis** → Frontend calls `/incident/analyze`
3. **Backend receives request** → Runs XGBoost model
4. **ML predictions returned** → Frontend displays results
5. **Real-time updates** → Dashboard shows ML insights

## 📱 Access Points

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **ML Model Test**: Run `python quick_demo.py`

## 🎉 Success Indicators

✅ Backend running on port 8000  
✅ Frontend running on port 5173  
✅ ML model loads without errors  
✅ API returns predictions with confidence scores  
✅ Frontend displays ML results in dashboard  

**Your ML model application is now running!** 🚀

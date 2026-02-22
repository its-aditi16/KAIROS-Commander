# 🔧 Backend Troubleshooting Guide

## ❌ Issue: Backend Not Starting

The error "0.0.0.0 took too long to respond" indicates the backend server is not running.

## 🛠️ Step-by-Step Solution

### Step 1: Check Python Installation

Open Command Prompt and run:

```cmd
python --version
```

If you get an error, try:

```cmd
python3 --version
```

### Step 2: Install Required Packages

```cmd
pip install fastapi uvicorn numpy pandas scikit-learn xgboost
```

### Step 3: Test ML Model Separately

```cmd
cd "c:\Users\ADITI CHAUHAN\OneDrive\Desktop\commander_ai"
python quick_demo.py
```

### Step 4: Start Backend (Try Multiple Methods)

#### Method A: Simple Backend

```cmd
cd "c:\Users\ADITI CHAUHAN\OneDrive\Desktop\commander_ai"
python simple_backend.py
```

#### Method B: Original Backend

```cmd
cd "c:\Users\ADITI CHAUHAN\OneDrive\Desktop\commander_ai"
python app/main.py
```

#### Method C: Batch File

```cmd
cd "c:\Users\ADITI CHAUHAN\OneDrive\Desktop\commander_ai"
start_backend.bat
```

## 🚀 Expected Success Output

When the backend starts successfully, you should see:

```
🚀 Starting ML Model Backend...
Server will be available at: http://localhost:8001
API docs at: http://localhost:8001/docs
INFO:     Started server process [12345]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8001
```

## 🌐 Verify Backend is Running

### Check 1: Health Endpoint

Open browser: **http://localhost:8001/health**
Expected: `{"status": "healthy", "model": "ready"}`

### Check 2: API Documentation

Open browser: **http://localhost:8001/docs**
Expected: Swagger UI with API endpoints

### Check 3: Root Endpoint

Open browser: **http://localhost:8001**
Expected: `{"message": "ML Model Backend is running!"}`

## 🔍 Common Issues & Solutions

### Issue 1: "ModuleNotFoundError"

**Solution**: Install missing packages

```cmd
pip install fastapi uvicorn numpy pandas scikit-learn xgboost
```

### Issue 2: Port Already in Use

**Solution**: Kill existing process or change port

```cmd
netstat -ano | findstr :8001
taskkill /PID <PID_NUMBER> /F
```

### Issue 3: Python Path Issues

**Solution**: Use absolute paths or run from correct directory

### Issue 4: ML Model Import Error

**Solution**: Check if ml_model.py exists in app/engines/

## 📱 Testing the Backend

### Test with curl (Command Prompt):

```cmd
curl http://localhost:8001
```

### Test API Endpoint:

```cmd
curl -X POST "http://localhost:8001/incident/analyze" ^
-H "Content-Type: application/json" ^
-d "{\"services\":{\"test\":{\"error_rate\":0.8,\"latency\":1600,\"cpu_usage\":85,\"downstream_failures\":4}}}"
```

## 🎯 Success Indicators

✅ Backend starts without errors  
✅ Server runs on port 8001  
✅ Health endpoint returns success  
✅ API docs accessible at /docs  
✅ ML predictions return correctly

## 🆘 If Still Not Working

### Option 1: Use Python HTTP Server

```cmd
cd "c:\Users\ADITI CHAUHAN\OneDrive\Desktop\commander_ai"
python -m http.server 8001
```

### Option 2: Check Firewall

- Windows Firewall may block port 8001
- Add exception for Python

### Option 3: Try Different Port

Edit `simple_backend.py`:

```python
uvicorn.run(app, host="0.0.0.0", port=3000, reload=True)
```

## 📞 Next Steps

Once backend is running:

1. Start frontend: `npm run dev`
2. Open browser: `http://localhost:5173`
3. Test ML integration through dashboard

**The backend must be running BEFORE you can access http://localhost:8001!**

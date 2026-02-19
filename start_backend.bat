@echo off
echo Starting ML Model Backend...
echo.

cd /d "C:\Users\ADITI CHAUHAN\OneDrive\Desktop\commander_ai"

echo Current directory: %CD%
echo.

echo Checking Python...
python --version
echo.

echo Installing required packages...
pip install fastapi uvicorn numpy pandas scikit-learn xgboost
echo.

echo Starting backend server...
echo Server will be available at: http://localhost:8000
echo API docs at: http://localhost:8000/docs
echo.
python app\main.py

pause

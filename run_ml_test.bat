@echo off
echo Starting ML Model Testing Suite...
echo.

cd /d "C:\Users\ADITI CHAUHAN\OneDrive\Desktop\commander_ai"

echo Current directory: %CD%
echo.

echo Testing Python availability...
python --version
echo.

echo Running ML model test...
python app\tests\simple_ml_test.py

echo.
echo Test completed.
pause

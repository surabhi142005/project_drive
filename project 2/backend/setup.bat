@echo off
REM RetainStream Backend Setup Script for Windows

echo.
echo 🚀 RetainStream Backend Setup
echo ==============================
echo.

REM Check Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Node.js not found. Please install Node.js 16+
    exit /b 1
)

REM Check Python
where python >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Python not found. Please install Python 3.8+
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
for /f "tokens=*" %%i in ('python --version') do set PY_VERSION=%%i

echo ✓ Node.js %NODE_VERSION%
echo ✓ Python %PY_VERSION%
echo.

REM Install Node dependencies
echo 📦 Installing Node.js dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ❌ npm install failed
    exit /b 1
)
echo ✓ Node dependencies installed
echo.

REM Install Python dependencies
echo 📦 Installing Python dependencies...
cd ml_service
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo ❌ pip install failed
    cd ..
    exit /b 1
)
cd ..
echo ✓ Python dependencies installed
echo.

REM Initialize database
echo 🗄️  Initializing database...
call npm run migrate
if %errorlevel% neq 0 (
    echo ❌ Database migration failed
    exit /b 1
)
echo ✓ Database initialized
echo.

echo ✅ Setup complete!
echo.
echo Next steps:
echo 1. Terminal 1: cd ml_service ^&^& python service.py
echo 2. Terminal 2: npm start
echo.
echo Then test: curl http://localhost:5000/api/health
pause

#!/bin/bash

# RetainStream Backend Setup Script
# Run this to set up the entire backend system

echo "🚀 RetainStream Backend Setup"
echo "=============================="

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 16+"
    exit 1
fi

# Check Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 not found. Please install Python 3.8+"
    exit 1
fi

echo "✓ Node.js $(node --version)"
echo "✓ Python $(python3 --version)"
echo ""

# Install Node dependencies
echo "📦 Installing Node.js dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "❌ npm install failed"
    exit 1
fi
echo "✓ Node dependencies installed"
echo ""

# Install Python dependencies
echo "📦 Installing Python dependencies..."
cd ml_service
pip install -r requirements.txt
if [ $? -ne 0 ]; then
    echo "❌ pip install failed"
    exit 1
fi
cd ..
echo "✓ Python dependencies installed"
echo ""

# Initialize database
echo "🗄️  Initializing database..."
npm run migrate
if [ $? -ne 0 ]; then
    echo "❌ Database migration failed"
    exit 1
fi
echo "✓ Database initialized"
echo ""

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Terminal 1: cd ml_service && python service.py"
echo "2. Terminal 2: npm start"
echo ""
echo "Then test: curl http://localhost:5000/api/health"

#!/bin/bash

# Flask Application Runner Script
# This script sets up the environment and runs the Flask application

echo "🚀 Starting Flask Application..."

# Navigate to the backend directory
cd "$(dirname "$0")"

# Activate virtual environment
echo "📦 Activating virtual environment..."
source venv/bin/activate

# Set Flask environment variables
export FLASK_APP=main.py
export FLASK_ENV=development
export FLASK_DEBUG=1

# Create upload directory if it doesn't exist
mkdir -p uploads/profile_images

echo "✅ Environment setup complete"
echo "🌐 Starting Flask server on http://localhost:5000"
echo "📁 Upload directory: $(pwd)/uploads/profile_images"
echo ""

# Run Flask application
flask run --host=0.0.0.0 --port=5000 
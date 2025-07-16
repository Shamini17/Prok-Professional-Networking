#!/bin/bash

# Backend Deployment Script
# This script prepares the backend for deployment

echo "🚀 Starting backend deployment preparation..."

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install/upgrade dependencies
echo "📦 Installing dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  Warning: .env file not found!"
    echo "📝 Please create a .env file with your environment variables"
    echo "📋 You can copy from env.example as a starting point"
fi

# Create upload directories if they don't exist
echo "📁 Creating upload directories..."
mkdir -p uploads/profile_images
mkdir -p uploads/banner_images
mkdir -p uploads/posts

# Set proper permissions
echo "🔐 Setting permissions..."
chmod 755 uploads/
chmod 755 uploads/profile_images/
chmod 755 uploads/banner_images/
chmod 755 uploads/posts/

# Test the application
echo "🧪 Testing application..."
python -c "
import os
os.environ['FLASK_CONFIG'] = 'testing'
from main import create_app
app = create_app('testing')
print('✅ Application imports successfully')
"

if [ $? -eq 0 ]; then
    echo "✅ Backend is ready for deployment!"
    echo "📋 Next steps:"
    echo "   1. Set environment variables in your deployment platform"
    echo "   2. Deploy using: gunicorn --bind 0.0.0.0:\$PORT main:app"
else
    echo "❌ Backend preparation failed!"
    exit 1
fi

echo "🎉 Backend deployment preparation completed!" 
#!/bin/bash

# Frontend Build Script for Production
# This script builds the frontend application for deployment

echo "🚀 Starting frontend build process..."

# Check if node_modules exists, if not install dependencies
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Clean previous build
echo "🧹 Cleaning previous build..."
rm -rf dist

# Build for production
echo "🔨 Building for production..."
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build completed successfully!"
    echo "📁 Build output: dist/"
    echo "📊 Build size:"
    du -sh dist/
else
    echo "❌ Build failed!"
    exit 1
fi

echo "🎉 Frontend is ready for deployment!" 
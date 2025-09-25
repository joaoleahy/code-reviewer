#!/bin/bash

# Build script for Render deployment
echo "🚀 Starting Render build process..."

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
pip install -r requirements.txt

# Install frontend dependencies and build
echo "🎨 Building frontend..."
cd ../frontend
npm install
npm run build

echo "✅ Build completed successfully!"
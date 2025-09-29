#!/bin/bash

# FatGrid API Explorer Startup Script

echo "🚀 Starting API Scraping Server..."
echo "=================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Check if package.json exists
if [ ! -f "package.json" ]; then
    echo "❌ package.json not found. Please run this script from the project directory."
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install dependencies."
        exit 1
    fi
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  No .env file found. Creating one..."
    cat > .env << EOF
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=fatgrid_db
DB_USER=root
DB_PASSWORD=
DB_DIALECT=mysql

# FatGrid API Configuration
FATGRID_BASE_URL=https://api.fatgrid.com
FATGRID_SESSION_TOKEN=your_fatgrid_session_token_here

# Server Configuration
PORT=3000
NODE_ENV=development

# CORS Configuration
CORS_ORIGIN=*
EOF
    echo "📝 Please edit .env file with your database credentials and API tokens."
fi

# Create exports directory if it doesn't exist
mkdir -p exports

# Start the server
echo "🌐 Starting server..."
echo "   API docs: http://localhost:3000/"
echo "   Health check: http://localhost:3000/health"
echo "   FatGrid endpoint: http://localhost:3000/fatgrid/get_data"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Start with nodemon if available, otherwise use node
if command -v nodemon &> /dev/null; then
    npm run dev
else
    npm start
fi

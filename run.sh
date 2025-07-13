#!/bin/bash

# Full app will run if user just does ./run.sh in their terminal

echo "🚀 Starting up Smart Groups!"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to print colored output
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

# Cleanup function
cleanup() {
    echo ""
    echo "🛑 Shutting down Smart Groups..."
    
    # Kill background processes
    if [[ ! -z "$BACKEND_PID" ]]; then
        kill $BACKEND_PID 2>/dev/null
        print_status "Backend server stopped"
    fi
    
    if [[ ! -z "$FRONTEND_PID" ]]; then
        kill $FRONTEND_PID 2>/dev/null
        print_status "Frontend server stopped"
    fi
    
    # Deactivate virtual environment
    if [[ "$VIRTUAL_ENV" ]]; then
        deactivate 2>/dev/null
    fi
    
    echo "👋 Smart Groups has been stopped. Goodbye!"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

echo ""
echo "📋 Checking system requirements..."

# Check if Python is installed
if command_exists python3; then
    PYTHON_VERSION=$(python3 --version 2>&1 | cut -d' ' -f2)
    print_status "Python 3 found (version $PYTHON_VERSION)"
elif command_exists python; then
    PYTHON_VERSION=$(python --version 2>&1 | cut -d' ' -f2)
    if [[ $PYTHON_VERSION == 3* ]]; then
        print_status "Python 3 found (version $PYTHON_VERSION)"
        alias python3=python
    else
        print_warning "Python 3 is required but Python 2 was found. Attempting to use pyenv to install Python 3.9..."
        if command_exists pyenv; then
            print_info "pyenv found. Installing Python 3.9."
            pyenv install 3.9.19 -s
            pyenv local 3.9.19
            export PATH="$(pyenv root)/shims:$PATH"
            print_status "Python 3.9.19 installed and activated via pyenv."
        else
            print_error "Python 3 is required but not found, and pyenv is not installed. Please install pyenv (https://github.com/pyenv/pyenv) and try again."
            exit 1
        fi
    fi
else
    print_warning "Python 3 is not installed. Attempting to use pyenv to install Python 3.9..."
    if command_exists pyenv; then
        print_info "pyenv found. Installing Python 3.9."
        pyenv install 3.9.19 -s
        pyenv local 3.9.19
        export PATH="$(pyenv root)/shims:$PATH"
        print_status "Python 3.9.19 installed and activated via pyenv."
    else
        print_error "Python 3 is not installed, and pyenv is not installed. Please install pyenv (https://github.com/pyenv/pyenv) and try again."
        exit 1
    fi
fi

# Check if pip is installed
if command_exists pip3; then
    print_status "pip3 found"
elif command_exists pip; then
    print_status "pip found"
    alias pip3=pip
else
    print_error "pip is not installed. Please install pip and try again."
    exit 1
fi

# Check if Node.js is installed
if command_exists node; then
    NODE_VERSION=$(node --version 2>&1)
    print_status "Node.js found (version $NODE_VERSION)"
else
    print_error "Node.js is not installed. Please install Node.js and try again."
    exit 1
fi

# Check if npm is installed
if command_exists npm; then
    NPM_VERSION=$(npm --version 2>&1)
    print_status "npm found (version $NPM_VERSION)"
else
    print_error "npm is not installed. Please install npm and try again."
    exit 1
fi

echo ""
echo "🔧 Setting up Python virtual environment..."

# Create virtual environment if it doesn't exist
if [[ ! -d "smartgroups_venv" ]]; then
    print_info "Creating virtual environment..."
    python3 -m venv smartgroups_venv
    print_status "Virtual environment created"
else
    print_status "Virtual environment already exists"
fi

# Activate virtual environment
print_info "Activating virtual environment..."
source smartgroups_venv/bin/activate
print_status "Virtual environment activated"

echo ""
echo "📦 Installing backend dependencies..."

# Install backend dependencies
cd backend
if [[ -f "requirements.txt" ]]; then
    print_info "Installing Python packages..."
    pip3 install -r requirements.txt
    print_status "Backend dependencies installed"
else
    print_error "requirements.txt not found in backend directory"
    exit 1
fi
cd ..

echo ""
echo "📦 Installing frontend dependencies..."

# Install frontend dependencies
cd frontend
if [[ -f "package.json" ]]; then
    print_info "Installing npm packages..."
    npm install
    print_status "Frontend dependencies installed"
else
    print_error "package.json not found in frontend directory"
    exit 1
fi
cd ..

echo ""
echo "🚀 Starting servers..."

# Start backend server
print_info "Starting backend server..."
cd backend
python3 app.py &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 3

# Start frontend server
print_info "Starting frontend server..."
cd frontend
npm start &
FRONTEND_PID=$!
cd ..

# Wait a moment for frontend to start
sleep 5

echo ""
echo "=================================================="
echo -e "${GREEN}🎉 Smart Groups is now running!${NC}"
echo "=================================================="
echo ""
echo -e "${BLUE}📱 Frontend:${NC} http://localhost:3000"
echo -e "${BLUE}🔧 Backend:${NC} http://localhost:5000"
echo ""
echo -e "${YELLOW}💡 Tips:${NC}"
echo "• Open your browser and go to http://localhost:3000"
echo "• To stop the app, press Ctrl+C in this terminal"
echo "• Keep this terminal window open while using the app"
echo ""
echo "=================================================="

# Wait for user to stop the application
wait






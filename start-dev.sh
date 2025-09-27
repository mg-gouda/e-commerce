#!/bin/bash

echo "🚀 Starting E-Commerce Development Environment..."

# Get the script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "📍 Working from: $SCRIPT_DIR"

# Start Docker services
echo "📦 Starting Docker services..."
docker-compose up -d

# Wait a moment for services to start
sleep 5

# Check if backend directory exists and start backend
if [ -d "backend" ]; then
    echo "🔧 Starting Backend (NestJS)..."
    (cd backend && npm run start:dev) &
    BACKEND_PID=$!
    echo "Backend PID: $BACKEND_PID"
else
    echo "❌ Backend directory not found"
fi

# Check if frontend directory exists and start frontend
if [ -d "frontend" ]; then
    echo "🎨 Starting Frontend (Next.js)..."
    (cd frontend && npm run dev) &
    FRONTEND_PID=$!
    echo "Frontend PID: $FRONTEND_PID"
else
    echo "❌ Frontend directory not found"
fi

echo "✅ Development environment started!"
echo "📊 Backend: http://localhost:3001"
echo "🌐 Frontend: http://localhost:3000"
echo ""
echo "To stop all processes, run: ./stop-dev.sh"

# Create stop script
cat > stop-dev.sh << 'EOF'
#!/bin/bash
echo "🛑 Stopping development environment..."
pkill -f "nest start"
pkill -f "next dev"
docker-compose down
echo "✅ All services stopped"
EOF

chmod +x stop-dev.sh
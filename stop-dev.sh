#!/bin/bash
echo "🛑 Stopping development environment..."
pkill -f "nest start"
pkill -f "next dev"
docker-compose down
echo "✅ All services stopped"

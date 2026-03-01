#!/bin/bash
# Setup and run Penpot self-hosted

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "================================"
echo "Penpot Self-Hosted Setup"
echo "================================"
echo ""

# Check Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker not found. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose not found. Please install Docker Compose first."
    exit 1
fi

echo "✅ Docker found"
echo ""

# Create directories
mkdir -p data/assets data/postgres

# Pull latest images
echo "📥 Pulling Penpot images..."
docker-compose pull

# Start services
echo "🚀 Starting Penpot services..."
docker-compose up -d

echo ""
echo "================================"
echo "✅ Penpot is starting up!"
echo "================================"
echo ""
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check status
echo ""
echo "📊 Service Status:"
docker-compose ps

echo ""
echo "🌐 Access Penpot at:"
echo "   http://localhost:9001"
echo ""
echo "📁 Data directories:"
echo "   Assets: ./data/assets"
echo "   Database: ./data/postgres"
echo ""
echo "🛑 To stop: docker-compose down"
echo "🗑️  To clean: docker-compose down -v"
echo ""

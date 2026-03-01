#!/bin/bash
# Test script for AI Design to Code + Penpot
# Run this on a machine WITH Docker installed

set -e

echo "================================"
echo "AI Design to Code + Penpot"
echo "Test & Validation Script"
echo "================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test functions
test_prerequisites() {
    echo "🔍 Testing Prerequisites..."
    
    if command -v docker &> /dev/null; then
        echo -e "${GREEN}✅ Docker installed${NC}"
        docker --version
    else
        echo -e "${RED}❌ Docker not found${NC}"
        exit 1
    fi
    
    if command -v docker-compose &> /dev/null; then
        echo -e "${GREEN}✅ Docker Compose installed${NC}"
    else
        echo -e "${RED}❌ Docker Compose not found${NC}"
        exit 1
    fi
    
    echo ""
}

test_env_file() {
    echo "🔍 Testing Environment Configuration..."
    
    if [ -f .env ]; then
        echo -e "${GREEN}✅ .env file exists${NC}"
        
        if grep -q "KIMI_API_KEY=your_" .env; then
            echo -e "${YELLOW}⚠️  KIMI_API_KEY not set properly${NC}"
            echo "   Please edit .env and add your real API key"
        else
            echo -e "${GREEN}✅ KIMI_API_KEY configured${NC}"
        fi
    else
        echo -e "${RED}❌ .env file not found${NC}"
        echo "   Creating from .env.example..."
        cp .env.example .env 2>/dev/null || echo "KIMI_API_KEY=your_key_here" > .env
        echo -e "${YELLOW}⚠️  Please edit .env before continuing${NC}"
    fi
    
    echo ""
}

test_docker_compose() {
    echo "🔍 Testing Docker Compose Configuration..."
    
    if [ -f docker-compose.full.yml ]; then
        echo -e "${GREEN}✅ docker-compose.full.yml found${NC}"
        
        # Validate syntax
        if docker-compose -f docker-compose.full.yml config > /dev/null 2>&1; then
            echo -e "${GREEN}✅ Docker Compose syntax valid${NC}"
        else
            echo -e "${RED}❌ Docker Compose syntax error${NC}"
        fi
    else
        echo -e "${RED}❌ docker-compose.full.yml not found${NC}"
    fi
    
    echo ""
}

test_start_services() {
    echo "🚀 Starting Services..."
    
    # Pull images
    echo "📥 Pulling Docker images..."
    docker-compose -f docker-compose.full.yml pull
    
    # Start
    echo "🚀 Starting containers..."
    docker-compose -f docker-compose.full.yml up -d
    
    echo ""
    echo "⏳ Waiting for services to initialize..."
    sleep 20
    
    echo ""
}

test_health_checks() {
    echo "🏥 Running Health Checks..."
    
    # Check AI Tool
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        echo -e "${GREEN}✅ AI Tool responding on port 3000${NC}"
    else
        echo -e "${YELLOW}⚠️  AI Tool not responding yet (may need more time)${NC}"
    fi
    
    # Check Penpot
    if curl -s http://localhost:9001 > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Penpot responding on port 9001${NC}"
    else
        echo -e "${YELLOW}⚠️  Penpot not responding yet (may need more time)${NC}"
    fi
    
    echo ""
}

test_show_status() {
    echo "📊 Container Status:"
    docker-compose -f docker-compose.full.yml ps
    
    echo ""
    echo "================================"
    echo -e "${GREEN}✅ Test Complete!${NC}"
    echo "================================"
    echo ""
    echo "🌐 Access your applications:"
    echo "   AI Design Tool: http://localhost:3000"
    echo "   Penpot:         http://localhost:9001"
    echo ""
    echo "📜 View logs:"
    echo "   docker-compose -f docker-compose.full.yml logs -f"
    echo ""
    echo "🛑 To stop:"
    echo "   docker-compose -f docker-compose.full.yml down"
    echo ""
}

# Main
main() {
    test_prerequisites
    test_env_file
    test_docker_compose
    
    read -p "Start services? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        test_start_services
        test_health_checks
        test_show_status
    else
        echo "Test aborted."
    fi
}

main "$@"

#!/bin/bash
# Quick start for macOS/Linux users

echo "========================================"
echo "AI Design to Code + Penpot"
echo "Quick Start"
echo "========================================"
echo ""

# Check Vagrant
if ! command -v vagrant &> /dev/null; then
    echo "❌ Vagrant not found"
    echo "Please install from: https://www.vagrantup.com/downloads"
    exit 1
fi

echo "✅ Vagrant found"

# Check VirtualBox
if ! command -v VBoxManage &> /dev/null; then
    echo "❌ VirtualBox not found"
    echo "Please install from: https://www.virtualbox.org/wiki/Downloads"
    exit 1
fi

echo "✅ VirtualBox found"
echo ""

# Start VM
echo "🚀 Starting VM..."
vagrant up

if [ $? -ne 0 ]; then
    echo "❌ Failed to start VM"
    exit 1
fi

echo ""
echo "========================================"
echo "✅ VM Started!"
echo "========================================"
echo ""
echo "Next steps:"
echo "1. vagrant ssh"
echo "2. Edit /opt/ai-design-to-code/.env with your KIMI_API_KEY"
echo "3. Run: start-ai-design"
echo ""
echo "Access:"
echo "  AI Tool: http://localhost:3000"
echo "  Penpot:  http://localhost:9001"
echo ""

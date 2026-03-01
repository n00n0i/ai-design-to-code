# -*- mode: ruby -*-
# vi: set ft=ruby :

Vagrant.configure("2") do |config|
  # Box
  config.vm.box = "ubuntu/jammy64"
  config.vm.box_version = "20241002.0.0"

  # VM Configuration
  config.vm.hostname = "ai-design-to-code"
  
  config.vm.provider "virtualbox" do |vb|
    vb.name = "ai-design-to-code"
    vb.memory = "4096"
    vb.cpus = 2
  end

  # Network
  config.vm.network "forwarded_port", guest: 3000, host: 3000, auto_correct: true
  config.vm.network "forwarded_port", guest: 9001, host: 9001, auto_correct: true
  config.vm.network "private_network", ip: "192.168.56.10"

  # Sync folder
  config.vm.synced_folder ".", "/vagrant", type: "virtualbox"

  # Provisioning
  config.vm.provision "shell", inline: <<-SHELL
    #!/bin/bash
    set -e

    echo "================================"
    echo "Setting up AI Design to Code VM"
    echo "================================"
    
    # Update system
    apt-get update
    apt-get upgrade -y
    
    # Install Docker
    echo "📦 Installing Docker..."
    apt-get install -y ca-certificates curl gnupg lsb-release
    mkdir -p /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
    apt-get update
    apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
    
    # Add vagrant user to docker group
    usermod -aG docker vagrant
    
    # Install Docker Compose v2
    echo "📦 Installing Docker Compose..."
    apt-get install -y docker-compose
    
    # Verify installation
    echo "✅ Verifying installation..."
    docker --version
    docker-compose --version
    
    # Setup project
    echo "📁 Setting up project..."
    mkdir -p /opt/ai-design-to-code
    cp -r /vagrant/* /opt/ai-design-to-code/
    cd /opt/ai-design-to-code
    
    # Create .env if not exists
    if [ ! -f .env ]; then
      echo "KIMI_API_KEY=your_kimi_api_key_here" > .env
      echo "⚠️  Please edit /opt/ai-design-to-code/.env and add your KIMI_API_KEY"
    fi
    
    # Create start script
    cat > /usr/local/bin/start-ai-design << 'EOF'
#!/bin/bash
cd /opt/ai-design-to-code
if [ -f .env ] && ! grep -q "your_kimi_api_key_here" .env; then
  echo "🚀 Starting AI Design to Code + Penpot..."
  docker-compose -f docker-compose.full.yml up -d
  echo ""
  echo "✅ Services started!"
  echo "   AI Tool: http://localhost:3000"
  echo "   Penpot:  http://localhost:9001"
else
  echo "❌ Please edit /opt/ai-design-to-code/.env and add your KIMI_API_KEY"
  exit 1
fi
EOF
    chmod +x /usr/local/bin/start-ai-design
    
    # Create stop script
    cat > /usr/local/bin/stop-ai-design << 'EOF'
#!/bin/bash
cd /opt/ai-design-to-code
docker-compose -f docker-compose.full.yml down
echo "✅ Services stopped"
EOF
    chmod +x /usr/local/bin/stop-ai-design
    
    # Create status script
    cat > /usr/local/bin/status-ai-design << 'EOF'
#!/bin/bash
cd /opt/ai-design-to-code
docker-compose -f docker-compose.full.yml ps
EOF
    chmod +x /usr/local/bin/status-ai-design
    
    echo ""
    echo "================================"
    echo "✅ VM Setup Complete!"
    echo "================================"
    echo ""
    echo "Next steps:"
    echo "1. vagrant ssh"
    echo "2. Edit /opt/ai-design-to-code/.env with your KIMI_API_KEY"
    echo "3. Run: start-ai-design"
    echo ""
    echo "Commands:"
    echo "  start-ai-design  - Start all services"
    echo "  stop-ai-design   - Stop all services"
    echo "  status-ai-design - Check service status"
    echo ""
  SHELL
end

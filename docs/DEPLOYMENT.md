# Deployment Guide

Complete deployment instructions for AI Design to Code.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Option 1: Docker Compose (Recommended)](#option-1-docker-compose-recommended)
- [Option 2: Vagrant VM](#option-2-vagrant-vm)
- [Option 3: Native Development](#option-3-native-development)
- [Production Deployment](#production-deployment)
- [Troubleshooting](#troubleshooting)

## Prerequisites

### All Methods

- Git
- Kimi API Key ([Get one here](https://platform.moonshot.cn/))

### Method-Specific

| Method | Requirements |
|:---|:---|
| Docker | Docker 20.10+, Docker Compose 2.0+ |
| Vagrant | Vagrant 2.3+, VirtualBox 7.0+ |
| Native | Node.js 18+, npm 9+ |

---

## Option 1: Docker Compose (Recommended)

### Quick Start

```bash
# 1. Clone repository
git clone https://github.com/yourusername/ai-design-to-code.git
cd ai-design-to-code

# 2. Configure environment
cp .env.example .env
# Edit .env and add your KIMI_API_KEY

# 3. Start services
docker-compose -f docker-compose.full.yml up -d

# 4. Access applications
# AI Tool: http://localhost:3000
# Penpot: http://localhost:9001
```

### Detailed Steps

#### Step 1: Install Docker

**Ubuntu/Debian:**
```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
newgrp docker
```

**macOS:**
```bash
brew install docker docker-compose
```

**Windows:**
Download from [Docker Desktop](https://www.docker.com/products/docker-desktop)

#### Step 2: Configure

```bash
# Create environment file
cat > .env << EOF
KIMI_API_KEY=your_actual_api_key_here
EOF
```

#### Step 3: Deploy

```bash
# Pull latest images
docker-compose -f docker-compose.full.yml pull

# Start in detached mode
docker-compose -f docker-compose.full.yml up -d

# Check status
docker-compose -f docker-compose.full.yml ps

# View logs
docker-compose -f docker-compose.full.yml logs -f
```

#### Step 4: Verify

```bash
# Test AI Tool
curl http://localhost:3000

# Test Penpot
curl http://localhost:9001
```

### Docker Commands

```bash
# Start
docker-compose -f docker-compose.full.yml up -d

# Stop
docker-compose -f docker-compose.full.yml down

# Restart
docker-compose -f docker-compose.full.yml restart

# Update
docker-compose -f docker-compose.full.yml pull
docker-compose -f docker-compose.full.yml up -d

# View logs
docker-compose -f docker-compose.full.yml logs -f [service-name]

# Shell into container
docker-compose -f docker-compose.full.yml exec ai-design-to-code sh
```

---

## Option 2: Vagrant VM

### Quick Start

```bash
# 1. Clone repository
git clone https://github.com/yourusername/ai-design-to-code.git
cd ai-design-to-code

# 2. Start VM
vagrant up

# 3. SSH and configure
vagrant ssh
sudo nano /opt/ai-design-to-code/.env
# Add your KIMI_API_KEY

# 4. Start services
start-ai-design

# 5. Access from host
# AI Tool: http://localhost:3000
# Penpot: http://localhost:9001
```

### Detailed Steps

#### Step 1: Install Vagrant & VirtualBox

**Ubuntu/Debian:**
```bash
# VirtualBox
sudo apt install virtualbox

# Vagrant
wget https://releases.hashicorp.com/vagrant/2.4.0/vagrant_2.4.0_linux_amd64.deb
sudo dpkg -i vagrant_2.4.0_linux_amd64.deb
```

**macOS:**
```bash
brew install --cask virtualbox
brew install --cask vagrant
```

**Windows:**
Download from:
- [VirtualBox](https://www.virtualbox.org/wiki/Downloads)
- [Vagrant](https://www.vagrantup.com/downloads)

#### Step 2: Start VM

```bash
# Start VM (first run takes 10-15 minutes)
vagrant up

# Check status
vagrant status

# SSH into VM
vagrant ssh
```

#### Step 3: Configure & Run

Inside VM:
```bash
# Edit environment
sudo nano /opt/ai-design-to-code/.env
# Add: KIMI_API_KEY=your_key_here

# Start services
start-ai-design

# Check status
status-ai-design
```

#### Step 4: Access

From host machine:
- AI Tool: http://localhost:3000
- Penpot: http://localhost:9001

### Vagrant Commands

```bash
# Start VM
vagrant up

# SSH into VM
vagrant ssh

# Stop VM
vagrant halt

# Restart VM
vagrant reload

# Destroy VM (data will be lost)
vagrant destroy

# Check status
vagrant status
```

---

## Option 3: Native Development

### Quick Start

```bash
# 1. Clone repository
git clone https://github.com/yourusername/ai-design-to-code.git
cd ai-design-to-code/my-app

# 2. Install dependencies
npm install

# 3. Configure environment
echo "KIMI_API_KEY=your_api_key_here" > .env.local

# 4. Run development server
npm run dev

# 5. Open http://localhost:3000
```

### Detailed Steps

#### Step 1: Install Node.js

**Ubuntu/Debian:**
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

**macOS:**
```bash
brew install node@20
```

**Windows:**
Download from [nodejs.org](https://nodejs.org/)

#### Step 2: Install Dependencies

```bash
cd my-app
npm install
```

#### Step 3: Configure

```bash
# Create environment file
echo "KIMI_API_KEY=your_api_key_here" > .env.local
```

#### Step 4: Run

```bash
# Development mode
npm run dev

# Production build
npm run build
npm start
```

---

## Production Deployment

### Environment Variables

```bash
# Required
KIMI_API_KEY=your_api_key

# Optional
PORT=3000
NODE_ENV=production
PENPOT_PUBLIC_URI=https://penpot.yourdomain.com
```

### Reverse Proxy (Nginx)

```nginx
server {
    listen 80;
    server_name ai-design.yourdomain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

server {
    listen 80;
    server_name penpot.yourdomain.com;
    
    location / {
        proxy_pass http://localhost:9001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }
}
```

### SSL (Let's Encrypt)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d ai-design.yourdomain.com -d penpot.yourdomain.com
```

### Systemd Service

```ini
# /etc/systemd/system/ai-design-to-code.service
[Unit]
Description=AI Design to Code
After=docker.service
Requires=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/opt/ai-design-to-code
ExecStart=/usr/bin/docker-compose -f docker-compose.full.yml up -d
ExecStop=/usr/bin/docker-compose -f docker-compose.full.yml down

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable ai-design-to-code
sudo systemctl start ai-design-to-code
```

---

## Troubleshooting

### Port Already in Use

```bash
# Find process using port
sudo lsof -i :3000

# Kill process
sudo kill -9 <PID>

# Or change port in docker-compose.yml
```

### Docker Permission Denied

```bash
# Add user to docker group
sudo usermod -aG docker $USER
newgrp docker
```

### Vagrant Port Forwarding Failed

```bash
# Change port in Vagrantfile
config.vm.network "forwarded_port", guest: 3000, host: 3001

# Reload VM
vagrant reload
```

### Kimi API Error

```bash
# Check API key
curl https://api.moonshot.cn/v1/models \
  -H "Authorization: Bearer $KIMI_API_KEY"
```

### Penpot Not Loading

```bash
# Check logs
docker-compose logs penpot-backend

# Wait longer (first startup takes time)
sleep 30
```

---

## Resource Requirements

| Deployment | CPU | RAM | Disk |
|:---|:---:|:---:|:---:|
| Docker (Full) | 3 cores | 4GB | 10GB |
| Vagrant | 2 cores | 4GB | 20GB |
| Native (AI Tool only) | 1 core | 1GB | 1GB |

---

## Next Steps

After deployment:
1. Configure domain and SSL
2. Set up monitoring
3. Configure backups
4. Add authentication (if needed)

# Vagrant Deployment Guide

Deploy AI Design to Code using Vagrant and VirtualBox.

## Why Vagrant?

- **Isolation:** Complete VM isolation from host
- **Consistency:** Same environment across all machines
- **Portability:** Easy to share and reproduce
- **Rollback:** Easy to destroy and recreate

## Requirements

- [Vagrant](https://www.vagrantup.com/downloads) 2.3+
- [VirtualBox](https://www.virtualbox.org/wiki/Downloads) 7.0+
- 8GB RAM (4GB for VM)
- 20GB free disk space

## Quick Start

```bash
# Clone repository
git clone https://github.com/yourusername/ai-design-to-code.git
cd ai-design-to-code

# Start VM
vagrant up

# SSH into VM
vagrant ssh

# Configure and start
sudo nano /opt/ai-design-to-code/.env
# Add your KIMI_API_KEY
start-ai-design

# Access from host
# AI Tool: http://localhost:3000
# Penpot: http://localhost:9001
```

## VM Specifications

| Spec | Value |
|:---|:---|
| OS | Ubuntu 22.04 LTS (Jammy) |
| RAM | 4GB |
| CPUs | 2 |
| Disk | 20GB dynamic |
| IP | 192.168.56.10 |

## Port Forwarding

| Host Port | Guest Port | Service |
|:---:|:---:|:---|
| 3000 | 3000 | AI Design Tool |
| 9001 | 9001 | Penpot |

## Commands

### Host Machine

```bash
# Start VM
vagrant up

# SSH into VM
vagrant ssh

# Stop VM
vagrant halt

# Restart VM
vagrant reload

# Destroy VM (removes all data)
vagrant destroy

# Check status
vagrant status

# View logs
vagrant logs
```

### Inside VM

```bash
# Start all services
start-ai-design

# Stop all services
stop-ai-design

# Check service status
status-ai-design

# View Docker logs
docker-compose -f /opt/ai-design-to-code/docker-compose.full.yml logs -f
```

## First Time Setup

1. **Start VM:**
   ```bash
   vagrant up
   ```
   This will:
   - Download Ubuntu 22.04 box (~500MB)
   - Install Docker and Docker Compose
   - Copy project files to VM
   - Create helper scripts

2. **Configure API Key:**
   ```bash
   vagrant ssh
   sudo nano /opt/ai-design-to-code/.env
   ```
   Add your Kimi API key from https://platform.moonshot.cn/

3. **Start Services:**
   ```bash
   start-ai-design
   ```

4. **Access:**
   - AI Tool: http://localhost:3000
   - Penpot: http://localhost:9001

## Troubleshooting

### VM Won't Start

```bash
# Check VirtualBox logs
vagrant up --debug

# Try different provider
vagrant up --provider=vmware_fusion
```

### Port Already in Use

Edit `Vagrantfile`:
```ruby
config.vm.network "forwarded_port", guest: 3000, host: 3001
```

Then:
```bash
vagrant reload
```

### Out of Memory

Edit `Vagrantfile`:
```ruby
vb.memory = "6144"  # Increase to 6GB
```

Then:
```bash
vagrant reload
```

### Synced Folder Issues

```bash
# Install VirtualBox Guest Additions
vagrant plugin install vagrant-vbguest
vagrant reload
```

## Customization

### Vagrantfile Options

```ruby
Vagrant.configure("2") do |config|
  # Change box
  config.vm.box = "ubuntu/focal64"
  
  # Increase resources
  config.vm.provider "virtualbox" do |vb|
    vb.memory = "8192"  # 8GB
    vb.cpus = 4
  end
  
  # Additional port forwarding
  config.vm.network "forwarded_port", guest: 8080, host: 8080
  
  # Public network (bridge)
  config.vm.network "public_network"
end
```

## Backup and Restore

### Backup VM

```bash
# Export VM
vagrant package --output ai-design-to-code.box
```

### Restore VM

```bash
# Import VM
vagrant box add ai-design-to-code ai-design-to-code.box
vagrant init ai-design-to-code
vagrant up
```

## Uninstallation

```bash
# Destroy VM
vagrant destroy

# Remove box
vagrant box remove ubuntu/jammy64

# Clean up
rm -rf .vagrant/
```

## Advanced Usage

### Multi-Machine Setup

```ruby
Vagrant.configure("2") do |config|
  config.vm.define "ai" do |ai|
    ai.vm.hostname = "ai-design"
    ai.vm.network "private_network", ip: "192.168.56.10"
  end
  
  config.vm.define "penpot" do |penpot|
    penpot.vm.hostname = "penpot"
    penpot.vm.network "private_network", ip: "192.168.56.11"
  end
end
```

### Provisioning Scripts

Add to `Vagrantfile`:
```ruby
config.vm.provision "shell", path: "scripts/setup.sh"
```

## Comparison with Docker

| Feature | Docker | Vagrant |
|:---|:---:|:---:|
| Startup Time | Fast | Slow (minutes) |
| Resource Usage | Low | Higher |
| Isolation | Process | Full VM |
| Portability | High | High |
| Learning Curve | Medium | Low |

Choose **Docker** for production, **Vagrant** for development/testing.

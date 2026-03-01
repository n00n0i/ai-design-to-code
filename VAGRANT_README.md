# AI Design to Code + Penpot - Vagrant Setup

Deploy on local VM using Vagrant + VirtualBox

## Requirements

- [Vagrant](https://www.vagrantup.com/downloads) 2.3+
- [VirtualBox](https://www.virtualbox.org/wiki/Downloads) 7.0+
- 8GB RAM (4GB for VM)
- 20GB Disk space

## Quick Start

### 1. Start VM

```bash
cd ai-design-to-code
vagrant up
```

### 2. Configure API Key

```bash
vagrant ssh

# Edit .env
sudo nano /opt/ai-design-to-code/.env
# Add: KIMI_API_KEY=your_actual_key_here
```

### 3. Start Services

```bash
# Inside VM
start-ai-design
```

### 4. Access

| Service | URL |
|:---|:---|
| AI Design Tool | http://localhost:3000 |
| Penpot | http://localhost:9001 |

## Commands

```bash
# Start VM
vagrant up

# SSH into VM
vagrant ssh

# Start services (inside VM)
start-ai-design

# Stop services (inside VM)
stop-ai-design

# Check status (inside VM)
status-ai-design

# Stop VM
vagrant halt

# Destroy VM
vagrant destroy

# Reload VM
vagrant reload
```

## VM Specs

- **OS:** Ubuntu 22.04 LTS
- **RAM:** 4GB
- **CPUs:** 2
- **Disk:** 20GB
- **IP:** 192.168.56.10

## Ports Forwarded

| Host | Guest | Service |
|:---|:---:|:---|
| 3000 | 3000 | AI Design Tool |
| 9001 | 9001 | Penpot |

## Troubleshooting

### Port conflict

```bash
# Change port in Vagrantfile
config.vm.network "forwarded_port", guest: 3000, host: 3001

# Reload
vagrant reload
```

### VM won't start

```bash
# Check VirtualBox logs
vagrant up --debug

# Or try different provider
vagrant up --provider=vmware_fusion
```

### Out of memory

Edit `Vagrantfile`:
```ruby
vb.memory = "6144"  # Increase to 6GB
```

Then:
```bash
vagrant reload
```

## Architecture

```
Host Machine
├── VirtualBox
│   └── Ubuntu VM (192.168.56.10)
│       ├── Docker
│       │   ├── AI Design Tool (:3000)
│       │   ├── Penpot Frontend (:9001)
│       │   ├── Penpot Backend
│       │   ├── Penpot Exporter
│       │   ├── PostgreSQL
│       │   └── Redis
│       └── Project Files (/opt/ai-design-to-code)
└── Port Forwarding (3000, 9001)
```

## Files

- `Vagrantfile` - VM configuration
- `/opt/ai-design-to-code/` - Project inside VM
- `/vagrant/` - Synced folder (host <-> guest)

## Getting Kimi API Key

1. Go to https://platform.moonshot.cn/
2. Sign up / Sign in
3. Create API Key
4. Copy and paste in `.env`

## Next Steps

After `vagrant up`:
1. Access AI Tool at http://localhost:3000
2. Access Penpot at http://localhost:9001
3. Create account in Penpot
4. Start designing!

---

**Note:** First `vagrant up` may take 10-15 minutes to download box and setup.

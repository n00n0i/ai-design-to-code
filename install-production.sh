#!/bin/bash
#
# AI Design to Code - Production Installer
# Version: 2.0.0
# Supports: Ubuntu 20.04+, Debian 11+, CentOS 8+, macOS 12+
#

set -euo pipefail

# Colors
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly NC='\033[0m'

# Configuration
readonly INSTALL_DIR="${INSTALL_DIR:-/opt/ai-design-to-code}"
readonly APP_USER="${APP_USER:-aidesign}"
readonly APP_GROUP="${APP_GROUP:-aidesign}"
readonly SERVICE_NAME="ai-design-to-code"
readonly LOG_DIR="/var/log/ai-design-to-code"
readonly DATA_DIR="/var/lib/ai-design-to-code"

# Logging
log_info() { echo -e "${BLUE}[INFO]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"; }

# Detect OS
detect_os() {
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        if [ -f /etc/os-release ]; then
            . /etc/os-release
            OS=$NAME
            VER=$VERSION_ID
        fi
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        OS="macOS"
        VER=$(sw_vers -productVersion)
    else
        log_error "Unsupported operating system: $OSTYPE"
        exit 1
    fi
    log_info "Detected OS: $OS $VER"
}

# Check if running as root
check_root() {
    if [[ $EUID -ne 0 ]]; then
        log_error "This installer must be run as root"
        exit 1
    fi
}

# Install Docker
install_docker() {
    log_info "Installing Docker..."
    
    if command -v docker &> /dev/null; then
        log_success "Docker already installed: $(docker --version)"
        return 0
    fi
    
    case "$OS" in
        "Ubuntu"*|"Debian"*)
            apt-get update
            apt-get install -y ca-certificates curl gnupg lsb-release
            mkdir -p /etc/apt/keyrings
            curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
            echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
            apt-get update
            apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
            ;;
        "CentOS"*|"Red Hat"*)
            yum install -y yum-utils
            yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
            yum install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
            systemctl start docker
            systemctl enable docker
            ;;
        "macOS")
            log_error "Please install Docker Desktop for Mac manually"
            exit 1
            ;;
    esac
    
    # Start Docker
    systemctl start docker || true
    systemctl enable docker || true
    
    log_success "Docker installed successfully"
}

# Install Docker Compose
install_docker_compose() {
    log_info "Installing Docker Compose..."
    
    if docker compose version &> /dev/null; then
        log_success "Docker Compose already installed"
        return 0
    fi
    
    # Install standalone docker-compose for older systems
    if ! command -v docker-compose &> /dev/null; then
        curl -L "https://github.com/docker/compose/releases/download/v2.23.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
        chmod +x /usr/local/bin/docker-compose
        ln -sf /usr/local/bin/docker-compose /usr/bin/docker-compose
    fi
    
    log_success "Docker Compose installed successfully"
}

# Create system user
create_user() {
    log_info "Creating system user..."
    
    if id "$APP_USER" &>/dev/null; then
        log_warn "User $APP_USER already exists"
    else
        groupadd -r "$APP_GROUP" 2>/dev/null || true
        useradd -r -g "$APP_GROUP" -d "$INSTALL_DIR" -s /bin/false "$APP_USER"
        log_success "Created user: $APP_USER"
    fi
    
    # Add current user to docker group
    SUDO_USER=${SUDO_USER:-$USER}
    if [ -n "$SUDO_USER" ] && [ "$SUDO_USER" != "root" ]; then
        usermod -aG docker "$SUDO_USER" 2>/dev/null || true
        log_info "Added $SUDO_USER to docker group"
    fi
}

# Create directories
create_directories() {
    log_info "Creating directories..."
    
    mkdir -p "$INSTALL_DIR"
    mkdir -p "$LOG_DIR"
    mkdir -p "$DATA_DIR"
    mkdir -p "$DATA_DIR/postgres"
    mkdir -p "$DATA_DIR/redis"
    mkdir -p "$DATA_DIR/uploads"
    
    chown -R "$APP_USER:$APP_GROUP" "$INSTALL_DIR"
    chown -R "$APP_USER:$APP_GROUP" "$LOG_DIR"
    chown -R "$APP_USER:$APP_GROUP" "$DATA_DIR"
    
    log_success "Directories created"
}

# Clone repository
clone_repo() {
    log_info "Cloning repository..."
    
    if [ -d "$INSTALL_DIR/.git" ]; then
        log_warn "Repository already exists, updating..."
        cd "$INSTALL_DIR"
        git pull origin main
    else
        git clone --depth 1 https://github.com/n00n0i/ai-design-to-code.git "$INSTALL_DIR"
    fi
    
    chown -R "$APP_USER:$APP_GROUP" "$INSTALL_DIR"
    log_success "Repository cloned"
}

# Configure environment
configure_environment() {
    log_info "Configuring environment..."
    
    cd "$INSTALL_DIR"
    
    # Generate secrets
    JWT_SECRET=$(openssl rand -hex 32)
    API_KEY=$(openssl rand -hex 16)
    ENCRYPTION_KEY=$(openssl rand -hex 32)
    
    cat > .env.production << EOF
# AI Design to Code - Production Configuration
NODE_ENV=production

# Application
APP_NAME=AI Design to Code
APP_VERSION=2.0.0
APP_URL=https://localhost:3000

# Security
JWT_SECRET=$JWT_SECRET
API_KEY=$API_KEY
ENCRYPTION_KEY=$ENCRYPTION_KEY
BCRYPT_ROUNDS=12

# Database
DATABASE_URL=postgresql://aidesign:${API_KEY}@postgres:5432/aidesign
POSTGRES_USER=aidesign
POSTGRES_PASSWORD=$API_KEY
POSTGRES_DB=aidesign

# Redis
REDIS_URL=redis://redis:6379
REDIS_PASSWORD=$API_KEY

# AI Providers
KIMI_API_KEY=
OPENAI_API_KEY=
DEFAULT_AI_PROVIDER=kimi
DEFAULT_AI_MODEL=kimi-k2-0711-preview

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
LOG_RETENTION_DAYS=30

# Monitoring
ENABLE_METRICS=true
METRICS_PORT=9090

# Storage
UPLOAD_DIR=/data/uploads
MAX_UPLOAD_SIZE=10485760

# Email (optional)
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=
EOF
    
    chmod 600 .env.production
    chown "$APP_USER:$APP_GROUP" .env.production
    
    log_success "Environment configured"
    log_warn "Please edit $INSTALL_DIR/.env.production and add your API keys"
}

# Create systemd service
create_systemd_service() {
    log_info "Creating systemd service..."
    
    cat > "/etc/systemd/system/${SERVICE_NAME}.service" << EOF
[Unit]
Description=AI Design to Code Platform
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=$INSTALL_DIR
User=$APP_USER
Group=$APP_GROUP
Environment="PATH=/usr/local/bin:/usr/bin:/bin"
Environment="COMPOSE_PROJECT_NAME=$SERVICE_NAME"
ExecStart=/usr/local/bin/docker-compose -f docker-compose.prod.yml up -d
ExecStop=/usr/local/bin/docker-compose -f docker-compose.prod.yml down
ExecReload=/usr/local/bin/docker-compose -f docker-compose.prod.yml restart
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF
    
    systemctl daemon-reload
    systemctl enable "$SERVICE_NAME"
    
    log_success "Systemd service created"
}

# Setup SSL with Let's Encrypt
setup_ssl() {
    log_info "SSL Certificate Setup"
    read -p "Do you want to setup SSL with Let's Encrypt? (y/N) " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        read -p "Enter your domain name: " domain
        
        # Install certbot
        case "$OS" in
            "Ubuntu"*|"Debian"*)
                apt-get install -y certbot
                ;;
            "CentOS"*|"Red Hat"*)
                yum install -y certbot
                ;;
        esac
        
        # Generate certificate
        certbot certonly --standalone -d "$domain" --agree-tos -n --email "admin@$domain" || true
        
        # Update environment
        sed -i "s|APP_URL=.*|APP_URL=https://$domain|" "$INSTALL_DIR/.env.production"
        
        log_success "SSL certificate configured for $domain"
    fi
}

# Setup firewall
setup_firewall() {
    log_info "Configuring firewall..."
    
    if command -v ufw &> /dev/null; then
        ufw allow 22/tcp
        ufw allow 80/tcp
        ufw allow 443/tcp
        ufw allow 3000/tcp
        ufw --force enable
        log_success "UFW firewall configured"
    elif command -v firewall-cmd &> /dev/null; then
        firewall-cmd --permanent --add-service=ssh
        firewall-cmd --permanent --add-service=http
        firewall-cmd --permanent --add-service=https
        firewall-cmd --permanent --add-port=3000/tcp
        firewall-cmd --reload
        log_success "Firewalld configured"
    fi
}

# Create backup script
create_backup_script() {
    log_info "Creating backup script..."
    
    cat > "$INSTALL_DIR/scripts/backup.sh" << 'EOF'
#!/bin/bash
BACKUP_DIR="/var/backups/ai-design-to-code"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p "$BACKUP_DIR"

# Backup database
docker exec ai-design-to-code-postgres pg_dump -U aidesign aidesign > "$BACKUP_DIR/db_$DATE.sql"

# Backup uploads
tar -czf "$BACKUP_DIR/uploads_$DATE.tar.gz" -C /var/lib/ai-design-to-code uploads

# Cleanup old backups (keep 7 days)
find "$BACKUP_DIR" -type f -mtime +7 -delete

echo "Backup completed: $DATE"
EOF
    
    chmod +x "$INSTALL_DIR/scripts/backup.sh"
    
    # Add to crontab
    (crontab -l 2>/dev/null; echo "0 2 * * * $INSTALL_DIR/scripts/backup.sh") | crontab -
    
    log_success "Backup script created"
}

# Health check
health_check() {
    log_info "Running health check..."
    
    cd "$INSTALL_DIR"
    
    # Start services
    docker-compose -f docker-compose.prod.yml up -d
    
    # Wait for services
    sleep 30
    
    # Check health endpoints
    if curl -sf http://localhost:3000/api/health > /dev/null; then
        log_success "Application is healthy"
    else
        log_warn "Application may not be fully started yet"
    fi
}

# Main installation
main() {
    echo "================================"
    echo "  AI Design to Code"
    echo "  Production Installer v2.0.0"
    echo "================================"
    echo
    
    check_root
    detect_os
    
    install_docker
    install_docker_compose
    create_user
    create_directories
    clone_repo
    configure_environment
    create_systemd_service
    setup_ssl
    setup_firewall
    create_backup_script
    
    echo
    echo "================================"
    log_success "Installation Complete!"
    echo "================================"
    echo
    echo "📁 Installation Directory: $INSTALL_DIR"
    echo "📊 Logs: $LOG_DIR"
    echo "💾 Data: $DATA_DIR"
    echo
    echo "🚀 Next Steps:"
    echo "   1. Edit $INSTALL_DIR/.env.production"
    echo "   2. Add your AI API keys"
    echo "   3. Run: systemctl start $SERVICE_NAME"
    echo "   4. Access: http://your-server:3000"
    echo
    echo "🛠️  Useful Commands:"
    echo "   systemctl start|stop|restart $SERVICE_NAME"
    echo "   docker-compose -f docker-compose.prod.yml logs -f"
    echo "   $INSTALL_DIR/scripts/backup.sh"
    echo
    log_warn "Please configure your API keys before starting the service!"
}

# Run main
main "$@"

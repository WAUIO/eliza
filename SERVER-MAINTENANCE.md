# 📘 Evolucia Server Maintenance Guide

## 1. System Requirements

### Prerequisites
- Google Cloud Engine (GCE) instance
- Node.js v23.3.0 (via nvm)
- pnpm 9+
- PM2 for process management
- Nginx with Certbot
- UFW firewall

## 2. Service Management

### PM2 Process Control
```bash
sudo su tmralala

# View all processes
pm2 list

# Restart core services
pm2 restart eliza-agent eliza-client

# Save process state
pm2 save

# View recent logs
pm2 logs --lines 100

# Monitor specific service
pm2 logs eliza-agent --lines 200
```

### Nginx Management
```bash
# Test configuration
sudo nginx -t

# Apply changes
sudo systemctl reload nginx

# View logs
sudo journalctl -u nginx -f
```

### SSL Certificate (Certbot)
```bash
# Test renewal
sudo certbot renew --dry-run

# Force renewal
sudo certbot renew -n

# View certificate status
sudo certbot certificates
```

## 3. Deployment Process

### Manual Deployment
```bash
# Switch to `tmralala` user
sudo su tmralala

# Switch to correct Node version
nvm use v23.3.0

# Update codebase
cd /var/www/eliza
git pull origin wau/develop

# Install dependencies
pnpm install --no-frozen-lockfile --lockfile-only
pnpm install

# Build all packages
pnpm build

# Restart services
pm2 reload ecosystem.config.js
```

### GitHub Actions Deployment
```yaml
name: Demo Deploy

on:
  push:
    branches:
      - wau/develop

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: SSH to GCE
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.GCE_IP }}
          username: tmralala
          key: ${{ secrets.GCE_SSH_KEY }}
          script: |
            cd /opt/elizaos/eliza
            git pull origin main
            pnpm clean
            pnpm install
            pnpm build
            pm2 restart ecosystem.config.js
```

## 4. Environment Configuration

### Setup
```bash
# Copy example config
cp .env.example .env

# Edit configuration
nano .env

# Verify permissions
chmod 600 .env
```

### Validation
```bash
# Switch to `tmralala` user
sudo su tmralala
# Check running processes
pm2 list  # Should show eliza-agent and eliza-client

# Verify ports
ss -tulpn | grep '3000\|5173\|8081'
```

## 5. Troubleshooting

### Common Issues

1. **Port Conflicts**
```bash
# Check used ports
ss -tulpn | grep '3000\|5173'

# List all listening ports
netstat -tulpn

# Check firewall rules
sudo ufw status
```

2. **Failed Deployments**
```bash
sudo su tmralala
cd /var/www/eliza
# Quick rollback
git checkout HEAD~1
pnpm build
pm2 restart all

# Check deployment logs
pm2 logs
```

3. **Memory Issues**
```bash
sudo su tmralala

# Monitor user processes
htop -u tmralala

# Restart with memory limit
pm2 restart eliza-agent --max-memory-restart 3G

# Check system memory
free -h
```

### Log Locations
```bash
sudo su tmralala

# Application logs
pm2 logs eliza-agent --lines 200
pm2 logs eliza-client --lines 200

# Nginx logs
tail -f /var/log/nginx/error.log
tail -f /var/log/nginx/access.log

# System logs
dmesg | tail -20
sudo iptables -L -n -v
```

## 6. Monitoring

### Service Status
```bash
sudo su tmralala

# Real-time monitoring
watch -n 5 "pm2 status; echo; systemctl status nginx"

# PM2 dashboard
pm2 monit

# Process tree
pstree -a tmralala
```

### Resource Usage
```bash
sudo su tmralala

# System resources
htop

# Disk usage
df -h

# Memory usage
free -h
vmstat 1
```

## 7. Security

### Firewall Configuration
```bash
# Allow HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Allow application ports
sudo ufw allow 3000/tcp  # API
sudo ufw allow 5173/tcp  # Development
sudo ufw allow 8081/tcp  # WebSocket

# Check status
sudo ufw status verbose
```

### SSL/TLS
```bash
# Check SSL configuration
sudo nginx -t
openssl s_client -connect yourdomain.com:443 -tls1_3

# View certificate expiry
echo | openssl s_client -servername yourdomain.com -connect yourdomain.com:443 2>/dev/null | openssl x509 -noout -dates
```

## 8. Backup & Recovery

### Configuration Backup
```bash
# Backup Nginx config
sudo cp /etc/nginx/sites-available/default /etc/nginx/sites-available/default.bak

# Backup PM2 processes
sudo su tmralala
pm2 save
cp ~/.pm2/dump.pm2 ~/.pm2/dump.pm2.bak

# Backup environment
cp .env .env.backup
```

## 9. Maintenance Schedule

1. **Daily**
   - Check PM2 process status
   - Monitor error logs
   - Verify health endpoints

2. **Weekly**
   - Review system resources
   - Backup configurations
   - Update SSL if needed

3. **Monthly**
   - Full system updates
   - SSL certificate renewal
   - Review and rotate logs 

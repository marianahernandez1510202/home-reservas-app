#!/bin/bash

set -e

echo "============================================"
echo "🔧 CONFIGURACIÓN INICIAL DEL VPS"
echo "============================================"
echo ""

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para imprimir mensajes
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Verificar si se está ejecutando como root
if [ "$EUID" -eq 0 ]; then
    print_error "No ejecutes este script como root. Usa un usuario normal con sudo."
    exit 1
fi

echo "👤 Usuario actual: $(whoami)"
echo "📅 Fecha: $(date)"
echo ""

# 1. Actualizar sistema
print_info "Actualizando sistema..."
sudo apt-get update -y
sudo apt-get upgrade -y
print_success "Sistema actualizado"
echo ""

# 2. Instalar dependencias básicas
print_info "Instalando dependencias básicas..."
sudo apt-get install -y \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release \
    git \
    wget \
    vim \
    htop \
    net-tools
print_success "Dependencias instaladas"
echo ""

# 3. Instalar Docker
print_info "Verificando Docker..."
if ! command -v docker &> /dev/null; then
    print_info "Docker no encontrado. Instalando..."

    # Agregar Docker GPG key
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

    # Agregar Docker repository
    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu \
      $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

    # Instalar Docker
    sudo apt-get update -y
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io

    # Agregar usuario al grupo docker
    sudo usermod -aG docker $USER

    print_success "Docker instalado"
else
    print_success "Docker ya está instalado: $(docker --version)"
fi
echo ""

# 4. Instalar Docker Compose
print_info "Verificando Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    print_info "Docker Compose no encontrado. Instalando..."

    # Descargar última versión de Docker Compose
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" \
        -o /usr/local/bin/docker-compose

    # Dar permisos de ejecución
    sudo chmod +x /usr/local/bin/docker-compose

    print_success "Docker Compose instalado"
else
    print_success "Docker Compose ya está instalado: $(docker-compose --version)"
fi
echo ""

# 5. Configurar Firewall (UFW)
print_info "Configurando firewall..."
if command -v ufw &> /dev/null; then
    sudo ufw allow 22/tcp comment 'SSH'
    sudo ufw allow 80/tcp comment 'HTTP'
    sudo ufw allow 443/tcp comment 'HTTPS'

    # Habilitar UFW si no está activo
    sudo ufw --force enable

    print_success "Firewall configurado"
    sudo ufw status
else
    print_warning "UFW no está instalado. Considera instalarlo para seguridad."
fi
echo ""

# 6. Crear estructura de directorios
print_info "Creando estructura de directorios..."
mkdir -p ~/blue-green-app/{nginx/conf.d,scripts,logs,backups}
print_success "Directorios creados"
echo ""

# 7. Configurar Git
print_info "Configurando Git..."
if ! git config --global user.name &> /dev/null; then
    read -p "Ingresa tu nombre para Git: " git_name
    read -p "Ingresa tu email para Git: " git_email
    git config --global user.name "$git_name"
    git config --global user.email "$git_email"
    print_success "Git configurado"
else
    print_success "Git ya está configurado: $(git config --global user.name)"
fi
echo ""

# 8. Configurar SSH (mejorar seguridad)
print_info "Configurando SSH para mayor seguridad..."
if [ -f ~/.ssh/authorized_keys ]; then
    # Crear backup de configuración SSH
    sudo cp /etc/ssh/sshd_config /etc/ssh/sshd_config.backup

    # Recomendaciones de seguridad (comentadas por defecto)
    print_info "Recomendaciones de seguridad SSH aplicadas al backup"
    print_warning "Revisa /etc/ssh/sshd_config.backup para cambios de seguridad"

    print_success "SSH configurado"
else
    print_warning "No se encontró authorized_keys. Configura las claves SSH manualmente."
fi
echo ""

# 9. Crear script de limpieza de Docker
print_info "Creando script de limpieza..."
cat > ~/blue-green-app/scripts/cleanup-docker.sh << 'EOF'
#!/bin/bash
echo "🧹 Limpiando recursos de Docker..."
docker system prune -af --volumes
echo "✅ Limpieza completada"
EOF
chmod +x ~/blue-green-app/scripts/cleanup-docker.sh
print_success "Script de limpieza creado: ~/blue-green-app/scripts/cleanup-docker.sh"
echo ""

# 10. Crear script de backup
print_info "Creando script de backup..."
cat > ~/blue-green-app/scripts/backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR=~/blue-green-app/backups
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="backup_$DATE.tar.gz"

echo "📦 Creando backup..."
tar -czf $BACKUP_DIR/$BACKUP_FILE \
    ~/blue-green-app/nginx \
    ~/blue-green-app/scripts \
    ~/blue-green-app/docker-compose-blue-green.yml

echo "✅ Backup creado: $BACKUP_FILE"
ls -lh $BACKUP_DIR/$BACKUP_FILE
EOF
chmod +x ~/blue-green-app/scripts/backup.sh
print_success "Script de backup creado: ~/blue-green-app/scripts/backup.sh"
echo ""

# 11. Verificar instalación
print_info "Verificando instalación..."
echo ""
echo "📊 Estado del sistema:"
echo "===================="
echo "🐳 Docker: $(docker --version)"
echo "🐙 Docker Compose: $(docker-compose --version)"
echo "📦 Git: $(git --version)"
echo "👤 Usuario: $(whoami)"
echo "🏠 Directorio: ~/blue-green-app"
echo ""

# Verificar que Docker está corriendo
if docker ps &> /dev/null; then
    print_success "Docker está corriendo correctamente"
else
    print_warning "Docker no está corriendo. Puedes necesitar reiniciar la sesión."
    print_info "Ejecuta: newgrp docker"
fi
echo ""

# 12. Mostrar próximos pasos
echo "============================================"
echo "✅ CONFIGURACIÓN COMPLETADA"
echo "============================================"
echo ""
echo "📝 Próximos pasos:"
echo ""
echo "1. Si es la primera vez que instalas Docker:"
echo "   newgrp docker"
echo "   (o cierra sesión y vuelve a conectar)"
echo ""
echo "2. Copia tus archivos al servidor:"
echo "   scp -r nginx scripts docker-compose-blue-green.yml .env.production \\"
echo "     $(whoami)@$(hostname -I | awk '{print $1}'):~/blue-green-app/"
echo ""
echo "3. Ve al directorio del proyecto:"
echo "   cd ~/blue-green-app"
echo ""
echo "4. Verifica los archivos:"
echo "   ls -la"
echo ""
echo "5. Da permisos a los scripts:"
echo "   chmod +x scripts/*.sh"
echo ""
echo "6. Ejecuta el primer despliegue:"
echo "   bash scripts/deploy-blue.sh 1.0.0"
echo ""
echo "7. Activa el ambiente Blue:"
echo "   bash scripts/switch.sh blue"
echo ""
echo "============================================"
echo ""

# 13. Crear archivo de información del sistema
cat > ~/blue-green-app/SYSTEM-INFO.txt << EOF
CONFIGURACIÓN DEL SISTEMA
========================

Fecha de instalación: $(date)
Usuario: $(whoami)
Hostname: $(hostname)
IP: $(hostname -I | awk '{print $1}')

Software instalado:
- Docker: $(docker --version)
- Docker Compose: $(docker-compose --version)
- Git: $(git --version)

Puertos abiertos:
- 22 (SSH)
- 80 (HTTP)
- 443 (HTTPS)

Directorios creados:
- ~/blue-green-app
- ~/blue-green-app/nginx
- ~/blue-green-app/scripts
- ~/blue-green-app/logs
- ~/blue-green-app/backups

Scripts útiles:
- ~/blue-green-app/scripts/cleanup-docker.sh (Limpieza de Docker)
- ~/blue-green-app/scripts/backup.sh (Backup del proyecto)
EOF

print_success "Información del sistema guardada en: ~/blue-green-app/SYSTEM-INFO.txt"
echo ""

print_success "¡Configuración del VPS completada exitosamente! 🎉"
echo ""

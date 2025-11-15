#!/bin/bash

echo "============================================"
echo "🔍 VERIFICACIÓN DE CONFIGURACIÓN"
echo "============================================"
echo ""

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Contadores
ERRORS=0
WARNINGS=0
SUCCESS=0

# Función para verificar
check() {
    local name=$1
    local command=$2

    echo -n "Verificando $name... "

    if eval "$command" &> /dev/null; then
        echo -e "${GREEN}✅${NC}"
        ((SUCCESS++))
        return 0
    else
        echo -e "${RED}❌${NC}"
        ((ERRORS++))
        return 1
    fi
}

# Función para advertencia
warn() {
    local name=$1
    local command=$2

    echo -n "Verificando $name... "

    if eval "$command" &> /dev/null; then
        echo -e "${GREEN}✅${NC}"
        ((SUCCESS++))
        return 0
    else
        echo -e "${YELLOW}⚠️${NC}"
        ((WARNINGS++))
        return 1
    fi
}

echo "🔍 Verificando requisitos del sistema..."
echo ""

# Sistema
check "Docker instalado" "command -v docker"
check "Docker Compose instalado" "command -v docker-compose"
check "Git instalado" "command -v git"
check "Curl instalado" "command -v curl"

echo ""
echo "🔍 Verificando servicios..."
echo ""

# Servicios
check "Docker corriendo" "docker ps"

echo ""
echo "🔍 Verificando archivos del proyecto..."
echo ""

# Archivos principales
check "docker-compose-blue-green.yml" "test -f docker-compose-blue-green.yml"
check "nginx-blue-green.conf" "test -f nginx/nginx-blue-green.conf"
check "blue.conf" "test -f nginx/conf.d/blue.conf"
check "green.conf" "test -f nginx/conf.d/green.conf"
check "active.conf" "test -f nginx/conf.d/active.conf"

echo ""
echo "🔍 Verificando scripts..."
echo ""

# Scripts
check "deploy-blue.sh" "test -x scripts/deploy-blue.sh"
check "deploy-green.sh" "test -x scripts/deploy-green.sh"
check "switch.sh" "test -x scripts/switch.sh"
check "health-check.sh" "test -x scripts/health-check.sh"
warn "deploy-complete.sh" "test -x scripts/deploy-complete.sh"
warn "setup-vps.sh" "test -x scripts/setup-vps.sh"

echo ""
echo "🔍 Verificando variables de entorno..."
echo ""

# Variables de entorno
warn ".env.production" "test -f .env.production"

if [ -f .env.production ]; then
    echo "   Verificando variables críticas:"

    source .env.production 2>/dev/null

    if [ -n "$MONGODB_URI" ]; then
        echo -e "   MONGODB_URI: ${GREEN}✅${NC}"
    else
        echo -e "   MONGODB_URI: ${RED}❌${NC}"
        ((ERRORS++))
    fi

    if [ -n "$JWT_SECRET" ]; then
        echo -e "   JWT_SECRET: ${GREEN}✅${NC}"
    else
        echo -e "   JWT_SECRET: ${RED}❌${NC}"
        ((ERRORS++))
    fi

    if [ -n "$GITHUB_REPOSITORY" ]; then
        echo -e "   GITHUB_REPOSITORY: ${GREEN}✅${NC}"
    else
        echo -e "   GITHUB_REPOSITORY: ${YELLOW}⚠️${NC}"
        ((WARNINGS++))
    fi
fi

echo ""
echo "🔍 Verificando pipeline CI/CD..."
echo ""

# Pipeline
check "GitHub Actions workflow" "test -f .github/workflows/blue-green-deploy.yml"

echo ""
echo "🔍 Verificando documentación..."
echo ""

# Documentación
check "BLUE-GREEN-DEPLOYMENT.md" "test -f BLUE-GREEN-DEPLOYMENT.md"
warn "README-BLUE-GREEN.md" "test -f README-BLUE-GREEN.md"
warn "GUIA-RAPIDA-DESPLIEGUE.md" "test -f blue-green-docs/GUIA-RAPIDA-DESPLIEGUE.md"
warn "RESULTADOS-Y-EVIDENCIAS.md" "test -f blue-green-docs/RESULTADOS-Y-EVIDENCIAS.md"

echo ""
echo "🔍 Verificando contenedores (si existen)..."
echo ""

# Contenedores
if docker ps -a | grep -q "app-blue"; then
    echo -e "Contenedor app-blue: ${GREEN}✅${NC}"

    if docker ps | grep -q "app-blue"; then
        echo "   Estado: Running ✅"
    else
        echo "   Estado: Stopped ⏸"
    fi
else
    echo -e "Contenedor app-blue: ${YELLOW}⚠️ No desplegado${NC}"
fi

if docker ps -a | grep -q "app-green"; then
    echo -e "Contenedor app-green: ${GREEN}✅${NC}"

    if docker ps | grep -q "app-green"; then
        echo "   Estado: Running ✅"
    else
        echo "   Estado: Stopped ⏸"
    fi
else
    echo -e "Contenedor app-green: ${YELLOW}⚠️ No desplegado${NC}"
fi

if docker ps -a | grep -q "nginx-lb"; then
    echo -e "Contenedor nginx-lb: ${GREEN}✅${NC}"

    if docker ps | grep -q "nginx-lb"; then
        echo "   Estado: Running ✅"
    else
        echo "   Estado: Stopped ⏸"
    fi
else
    echo -e "Contenedor nginx-lb: ${YELLOW}⚠️ No desplegado${NC}"
fi

echo ""
echo "🔍 Verificando permisos de scripts..."
echo ""

for script in scripts/*.sh; do
    if [ -x "$script" ]; then
        echo -e "$(basename $script): ${GREEN}✅${NC}"
    else
        echo -e "$(basename $script): ${RED}❌ No ejecutable${NC}"
        echo "   Ejecuta: chmod +x $script"
        ((ERRORS++))
    fi
done

echo ""
echo "============================================"
echo "📊 RESUMEN DE VERIFICACIÓN"
echo "============================================"
echo ""

echo -e "${GREEN}✅ Éxitos: $SUCCESS${NC}"
echo -e "${YELLOW}⚠️  Advertencias: $WARNINGS${NC}"
echo -e "${RED}❌ Errores: $ERRORS${NC}"

echo ""

if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}============================================${NC}"
    echo -e "${GREEN}✅ TODO CORRECTO - LISTO PARA DESPLEGAR${NC}"
    echo -e "${GREEN}============================================${NC}"
    echo ""
    echo "📝 Próximos pasos:"
    echo "   1. Si no tienes .env.production, créalo desde .env.production.example"
    echo "   2. Ejecuta: bash scripts/deploy-blue.sh 1.0.0"
    echo "   3. Activa Blue: bash scripts/switch.sh blue"
    echo ""
    exit 0
else
    echo -e "${RED}============================================${NC}"
    echo -e "${RED}❌ ERRORES ENCONTRADOS - CORRIGE ANTES DE DESPLEGAR${NC}"
    echo -e "${RED}============================================${NC}"
    echo ""
    echo "📝 Acciones recomendadas:"

    if ! command -v docker &> /dev/null; then
        echo "   - Instala Docker"
    fi

    if ! docker ps &> /dev/null; then
        echo "   - Inicia el servicio de Docker: sudo systemctl start docker"
    fi

    if [ ! -f .env.production ]; then
        echo "   - Crea .env.production desde .env.production.example"
    fi

    if [ $ERRORS -gt 0 ]; then
        echo "   - Revisa los archivos y permisos marcados con ❌"
    fi

    echo ""
    exit 1
fi

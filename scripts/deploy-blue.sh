#!/bin/bash

set -e

echo "============================================"
echo "🔵 BLUE DEPLOYMENT - INICIANDO"
echo "============================================"

# Variables
VERSION=${1:-"1.0.0"}
COMPOSE_FILE="docker-compose-blue-green.yml"
CONTAINER_NAME="app-blue"

echo ""
echo "📋 Configuración:"
echo "   - Versión: $VERSION"
echo "   - Contenedor: $CONTAINER_NAME"
echo "   - Fecha: $(date '+%Y-%m-%d %H:%M:%S')"
echo ""

# Cargar variables de entorno desde .env.production
if [ -f .env.production ]; then
    echo "📦 Cargando variables de entorno..."
    set -o allexport
    source .env.production
    set +o allexport
fi

# Exportar versión para docker-compose
export VERSION=$VERSION
export DEPLOY_ENV=blue

# Verificar si el contenedor ya existe
if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    echo "⚠️  El contenedor $CONTAINER_NAME ya existe. Deteniéndolo..."
    docker stop $CONTAINER_NAME || true
    docker rm $CONTAINER_NAME || true
fi

# Pull de imágenes más recientes
echo ""
echo "⬇️ Descargando imágenes más recientes..."
docker compose -f $COMPOSE_FILE pull app-blue || echo "Pull falló, continuando..."

# Desplegar contenedor Blue
echo ""
echo "🚀 Desplegando contenedor Blue..."
docker compose -f $COMPOSE_FILE up -d app-blue --force-recreate

# Esperar a que el servicio esté listo
echo ""
echo "⏳ Esperando a que el servicio Blue esté listo..."
sleep 10

# Health check
echo ""
echo "🏥 Ejecutando health check..."
if bash scripts/health-check.sh $CONTAINER_NAME 5000; then
    echo ""
    echo "============================================"
    echo "✅ DESPLIEGUE BLUE COMPLETADO CON ÉXITO"
    echo "============================================"
    echo ""
    echo "📝 Próximos pasos:"
    echo "   1. Verificar el servicio manualmente"
    echo "   2. Ejecutar: bash scripts/switch.sh blue"
    echo "   3. Para activar en producción"
    echo ""
    exit 0
else
    echo ""
    echo "============================================"
    echo "❌ ERROR EN EL DESPLIEGUE BLUE"
    echo "============================================"
    echo ""
    echo "El contenedor no pasó el health check."
    echo "Revisa los logs con: docker logs $CONTAINER_NAME"
    echo ""
    exit 1
fi

#!/bin/bash

set -e

ENVIRONMENT=${1}
NGINX_CONTAINER="nginx-lb"

echo "============================================"
echo "🔄 SWITCH TRAFFIC - Blue-Green Deployment"
echo "============================================"
echo ""

# Validar parámetro
if [ -z "$ENVIRONMENT" ]; then
    echo "❌ Error: Debes especificar el entorno"
    echo ""
    echo "Uso: bash scripts/switch.sh [blue|green]"
    echo ""
    echo "Ejemplos:"
    echo "  bash scripts/switch.sh blue   # Cambia tráfico a Blue"
    echo "  bash scripts/switch.sh green  # Cambia tráfico a Green"
    echo ""
    exit 1
fi

if [ "$ENVIRONMENT" != "blue" ] && [ "$ENVIRONMENT" != "green" ]; then
    echo "❌ Error: Entorno inválido '$ENVIRONMENT'"
    echo "   Usa 'blue' o 'green'"
    echo ""
    exit 1
fi

# Determinar el otro ambiente
if [ "$ENVIRONMENT" == "blue" ]; then
    OTHER_ENV="green"
    COLOR="🔵"
else
    OTHER_ENV="blue"
    COLOR="🟢"
fi

echo "📋 Información:"
echo "   - Ambiente objetivo: $COLOR $ENVIRONMENT"
echo "   - Ambiente anterior: $OTHER_ENV"
echo "   - Fecha: $(date '+%Y-%m-%d %H:%M:%S')"
echo ""

# Verificar que el contenedor del nuevo ambiente esté corriendo
TARGET_CONTAINER="app-$ENVIRONMENT"
if ! docker ps --format '{{.Names}}' | grep -q "^${TARGET_CONTAINER}$"; then
    echo "❌ Error: El contenedor $TARGET_CONTAINER no está corriendo"
    echo ""
    echo "Primero debes desplegar el ambiente $ENVIRONMENT:"
    echo "   bash scripts/deploy-$ENVIRONMENT.sh"
    echo ""
    exit 1
fi

# Health check del ambiente objetivo
echo "🏥 Verificando salud del ambiente $ENVIRONMENT..."
if ! bash scripts/health-check.sh $TARGET_CONTAINER 5000; then
    echo ""
    echo "❌ Error: El ambiente $ENVIRONMENT no está saludable"
    echo "   No se puede cambiar el tráfico a un ambiente no saludable"
    echo ""
    exit 1
fi

# Realizar el switch
echo ""
echo "🔄 Cambiando configuración de Nginx..."

# Copiar la configuración correspondiente
cp nginx/conf.d/$ENVIRONMENT.conf nginx/conf.d/active.conf

echo "   ✓ Configuración actualizada"

# Verificar configuración de Nginx
echo ""
echo "🔍 Validando configuración de Nginx..."
if docker exec $NGINX_CONTAINER nginx -t 2>&1 | grep -q "successful"; then
    echo "   ✓ Configuración válida"
else
    echo "   ❌ Error en la configuración de Nginx"
    docker exec $NGINX_CONTAINER nginx -t
    exit 1
fi

# Recargar Nginx
echo ""
echo "♻️  Recargando Nginx..."
if docker exec $NGINX_CONTAINER nginx -s reload; then
    echo "   ✓ Nginx recargado exitosamente"
else
    echo "   ❌ Error al recargar Nginx"
    exit 1
fi

# Esperar un momento para que el cambio se propague
sleep 2

# Verificar el cambio
echo ""
echo "🔍 Verificando el cambio..."
echo ""

# Intentar hacer una petición para verificar
RESPONSE=$(curl -s http://localhost:5000/ || echo "Error al conectar")

echo "============================================"
echo "✅ SWITCH COMPLETADO CON ÉXITO"
echo "============================================"
echo ""
echo "$COLOR Ahora estás en ambiente: $ENVIRONMENT"
echo ""
echo "📊 Estado actual:"
echo "   - Ambiente activo: $ENVIRONMENT"
echo "   - Contenedor: $TARGET_CONTAINER"
echo "   - Nginx: Recargado"
echo ""
echo "📝 Próximos pasos:"
echo "   1. Verificar que todo funciona correctamente"
echo "   2. Monitorear logs: docker logs -f $TARGET_CONTAINER"
echo "   3. Si hay problemas, hacer rollback: bash scripts/switch.sh $OTHER_ENV"
echo ""
echo "🔗 Endpoints:"
echo "   - Aplicación: http://localhost"
echo "   - Health: http://localhost/nginx-health"
echo ""

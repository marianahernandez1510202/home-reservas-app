#!/bin/bash

CONTAINER_NAME=${1:-"app-blue"}
PORT=${2:-"5000"}
MAX_ATTEMPTS=30
ATTEMPT=0

echo "🔍 Verificando salud de $CONTAINER_NAME en puerto $PORT..."
echo ""

# Verificar si el contenedor está corriendo
if ! docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    echo "❌ Error: El contenedor $CONTAINER_NAME no está corriendo"
    exit 1
fi

# Intentar conectar al health endpoint
while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
    ATTEMPT=$((ATTEMPT + 1))

    echo "   Intento $ATTEMPT/$MAX_ATTEMPTS..."

    # Intentar hacer una petición HTTP al contenedor
    if docker exec $CONTAINER_NAME curl -f -s http://localhost:$PORT/api/health >/dev/null 2>&1 || \
       docker exec $CONTAINER_NAME wget -q -O- http://localhost:$PORT/api/health >/dev/null 2>&1 || \
       docker exec $CONTAINER_NAME curl -f -s http://localhost:$PORT/ >/dev/null 2>&1; then
        echo ""
        echo "✅ $CONTAINER_NAME está saludable y respondiendo!"
        echo ""

        # Mostrar información del contenedor
        echo "📊 Información del contenedor:"
        docker inspect $CONTAINER_NAME --format='   - ID: {{.Id}}' | cut -c1-50
        docker inspect $CONTAINER_NAME --format='   - Estado: {{.State.Status}}'
        docker inspect $CONTAINER_NAME --format='   - Creado: {{.Created}}' | cut -c1-50

        exit 0
    fi

    # Si no es el último intento, esperar antes de reintentar
    if [ $ATTEMPT -lt $MAX_ATTEMPTS ]; then
        sleep 2
    fi
done

echo ""
echo "❌ Error: $CONTAINER_NAME no respondió después de $MAX_ATTEMPTS intentos"
echo ""
echo "📋 Logs del contenedor:"
docker logs --tail 20 $CONTAINER_NAME
echo ""

exit 1

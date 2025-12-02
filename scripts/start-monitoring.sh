#!/bin/bash

echo "============================================"
echo "📊 INICIANDO STACK DE MONITOREO"
echo "   Prometheus + Grafana + cAdvisor"
echo "============================================"
echo ""

# Verificar que Docker esté corriendo
if ! docker info > /dev/null 2>&1; then
    echo "❌ Error: Docker no está corriendo"
    exit 1
fi

# Crear la red si no existe
echo "🔧 Verificando red home-network..."
docker network create home-network 2>/dev/null || true

# Iniciar el stack de monitoreo
echo ""
echo "🚀 Iniciando servicios de monitoreo..."
docker compose -f docker-compose.monitoring.yml up -d

# Esperar a que los servicios estén listos
echo ""
echo "⏳ Esperando a que los servicios estén listos..."
sleep 10

# Verificar estado
echo ""
echo "🔍 Estado de los servicios:"
docker compose -f docker-compose.monitoring.yml ps

echo ""
echo "============================================"
echo "✅ MONITOREO INICIADO CORRECTAMENTE"
echo "============================================"
echo ""
echo "📊 URLs de acceso:"
echo "   - Grafana:    http://localhost:3001"
echo "   - Prometheus: http://localhost:9090"
echo "   - cAdvisor:   http://localhost:8081"
echo ""
echo "🔑 Credenciales de Grafana:"
echo "   - Usuario: admin"
echo "   - Password: admin123"
echo ""
echo "📈 Dashboard preconfigurado:"
echo "   - Docker Containers Monitoring"
echo ""

#!/bin/bash

echo "============================================"
echo "🛑 DETENIENDO STACK DE MONITOREO"
echo "============================================"
echo ""

docker compose -f docker-compose.monitoring.yml down

echo ""
echo "✅ Monitoreo detenido correctamente"
echo ""

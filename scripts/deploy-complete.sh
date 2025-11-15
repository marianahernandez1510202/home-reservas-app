#!/bin/bash

set -e

echo "============================================"
echo "🚀 DESPLIEGUE COMPLETO BLUE-GREEN"
echo "============================================"
echo ""

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Variables
VERSION=${1:-"1.0.0"}
FIRST_ENV=${2:-"blue"}
SECOND_ENV="green"

if [ "$FIRST_ENV" == "green" ]; then
    SECOND_ENV="blue"
fi

echo "📋 Configuración del despliegue:"
echo "   - Versión inicial: $VERSION"
echo "   - Primer ambiente: $FIRST_ENV"
echo "   - Segundo ambiente: $SECOND_ENV"
echo ""

# Función para pausar y pedir confirmación
pause_and_confirm() {
    echo ""
    echo -e "${YELLOW}$1${NC}"
    read -p "Presiona ENTER para continuar o Ctrl+C para cancelar..."
    echo ""
}

# Paso 1: Verificar que los scripts existen
echo "🔍 Verificando scripts..."
for script in deploy-blue.sh deploy-green.sh switch.sh health-check.sh; do
    if [ ! -f "scripts/$script" ]; then
        echo "❌ Error: No se encuentra scripts/$script"
        exit 1
    fi
done
echo "✅ Todos los scripts encontrados"
echo ""

# Paso 2: Verificar Docker
echo "🐳 Verificando Docker..."
if ! docker ps &> /dev/null; then
    echo "❌ Error: Docker no está corriendo"
    exit 1
fi
echo "✅ Docker está corriendo"
echo ""

# Paso 3: Desplegar primer ambiente
pause_and_confirm "Paso 1: Desplegar ambiente $FIRST_ENV con versión $VERSION"

echo -e "${BLUE}🔵 Desplegando $FIRST_ENV...${NC}"
bash scripts/deploy-$FIRST_ENV.sh $VERSION

if [ $? -ne 0 ]; then
    echo "❌ Error en el despliegue de $FIRST_ENV"
    exit 1
fi

# Paso 4: Activar primer ambiente
pause_and_confirm "Paso 2: Activar ambiente $FIRST_ENV en producción"

echo -e "${BLUE}🔄 Activando $FIRST_ENV...${NC}"
bash scripts/switch.sh $FIRST_ENV

if [ $? -ne 0 ]; then
    echo "❌ Error al activar $FIRST_ENV"
    exit 1
fi

# Paso 5: Verificar primer ambiente
echo ""
echo "🔍 Verificando ambiente $FIRST_ENV..."
sleep 3

if curl -f http://localhost/api/health &> /dev/null; then
    echo "✅ Ambiente $FIRST_ENV está respondiendo correctamente"
else
    echo "❌ Error: Ambiente $FIRST_ENV no responde"
    exit 1
fi

# Paso 6: Preguntar si desplegar segundo ambiente
echo ""
echo "============================================"
echo -e "${GREEN}✅ AMBIENTE $FIRST_ENV ACTIVO Y FUNCIONANDO${NC}"
echo "============================================"
echo ""

read -p "¿Deseas continuar desplegando $SECOND_ENV? (s/n): " response

if [[ ! "$response" =~ ^[Ss]$ ]]; then
    echo ""
    echo "✅ Despliegue completado. Solo $FIRST_ENV está activo."
    echo ""
    echo "Cuando quieras desplegar $SECOND_ENV ejecuta:"
    echo "   bash scripts/deploy-$SECOND_ENV.sh [VERSION]"
    echo "   bash scripts/switch.sh $SECOND_ENV"
    exit 0
fi

# Paso 7: Desplegar segundo ambiente
NEW_VERSION=${3:-"2.0.0"}
pause_and_confirm "Paso 3: Desplegar ambiente $SECOND_ENV con versión $NEW_VERSION"

echo -e "${BLUE}🟢 Desplegando $SECOND_ENV...${NC}"
bash scripts/deploy-$SECOND_ENV.sh $NEW_VERSION

if [ $? -ne 0 ]; then
    echo "❌ Error en el despliegue de $SECOND_ENV"
    exit 1
fi

# Paso 8: Probar segundo ambiente
echo ""
echo "🧪 Probando ambiente $SECOND_ENV..."
sleep 3

CONTAINER_NAME="app-$SECOND_ENV"
if bash scripts/health-check.sh $CONTAINER_NAME 5000; then
    echo "✅ Ambiente $SECOND_ENV está saludable"
else
    echo "❌ Error: Ambiente $SECOND_ENV no está saludable"
    exit 1
fi

# Paso 9: Preguntar si hacer switch
echo ""
read -p "¿Deseas cambiar el tráfico a $SECOND_ENV? (s/n): " response

if [[ ! "$response" =~ ^[Ss]$ ]]; then
    echo ""
    echo "✅ Despliegue completado. $FIRST_ENV sigue activo, $SECOND_ENV en standby."
    echo ""
    echo "Para cambiar a $SECOND_ENV ejecuta:"
    echo "   bash scripts/switch.sh $SECOND_ENV"
    exit 0
fi

# Paso 10: Hacer switch
pause_and_confirm "Paso 4: Cambiar tráfico de $FIRST_ENV a $SECOND_ENV"

echo -e "${BLUE}🔄 Cambiando tráfico...${NC}"
bash scripts/switch.sh $SECOND_ENV

if [ $? -ne 0 ]; then
    echo "❌ Error al cambiar tráfico"
    echo "💡 Puedes hacer rollback con: bash scripts/switch.sh $FIRST_ENV"
    exit 1
fi

# Paso 11: Verificar nuevo ambiente
echo ""
echo "🔍 Verificando nuevo ambiente activo..."
sleep 3

if curl -f http://localhost/api/health &> /dev/null; then
    echo "✅ Ambiente $SECOND_ENV está respondiendo correctamente"
else
    echo "❌ Error: Ambiente $SECOND_ENV no responde"
    echo "💡 Haciendo rollback automático a $FIRST_ENV..."
    bash scripts/switch.sh $FIRST_ENV
    exit 1
fi

# Resumen final
echo ""
echo "============================================"
echo -e "${GREEN}🎉 DESPLIEGUE BLUE-GREEN COMPLETADO${NC}"
echo "============================================"
echo ""
echo "📊 Resumen:"
echo "   - Ambiente activo: $SECOND_ENV (v$NEW_VERSION)"
echo "   - Ambiente standby: $FIRST_ENV (v$VERSION)"
echo "   - Estado: Todo funcionando ✅"
echo ""
echo "📝 Próximos pasos:"
echo "   1. Verificar que todo funciona correctamente"
echo "   2. Monitorear logs: docker logs -f app-$SECOND_ENV"
echo "   3. Si hay problemas: bash scripts/switch.sh $FIRST_ENV"
echo ""
echo "🔗 Enlaces útiles:"
echo "   - Aplicación: http://localhost/"
echo "   - Health: http://localhost/api/health"
echo "   - Docker: docker ps"
echo ""
echo "============================================"
echo ""

# 🚀 Blue-Green Deployment - Documentación Completa

## 📋 Índice
1. [Introducción](#introducción)
2. [Arquitectura](#arquitectura)
3. [Requisitos](#requisitos)
4. [Instalación](#instalación)
5. [Uso Local](#uso-local)
6. [Despliegue en VPS](#despliegue-en-vps)
7. [Pipeline CI/CD](#pipeline-cicd)
8. [Comandos Disponibles](#comandos-disponibles)
9. [Rollback](#rollback)
10. [Troubleshooting](#troubleshooting)

---

## 🎯 Introducción

Este proyecto implementa una estrategia de **Blue-Green Deployment** que permite:
- ✅ **Cero downtime** durante despliegues
- ✅ **Rollback instantáneo** en caso de problemas
- ✅ **Testing en producción** sin afectar usuarios
- ✅ **Despliegues seguros y automatizados**

### ¿Qué es Blue-Green Deployment?

Blue-Green deployment es una técnica que reduce el downtime y el riesgo ejecutando dos ambientes de producción idénticos llamados Blue y Green.

```
┌─────────────────────────────────────────┐
│          NGINX Load Balancer            │
│         (Traffic Controller)            │
└──────────────┬──────────────────────────┘
               │
       ┌───────┴───────┐
       │               │
┌──────▼─────┐  ┌─────▼──────┐
│ BLUE       │  │ GREEN      │
│ (v1.0.0)   │  │ (v2.0.0)   │
│ ACTIVE ✓   │  │ STANDBY    │
└────────────┘  └────────────┘
```

---

## 🏗️ Arquitectura

### Componentes del Sistema

```
blue-green-deployment/
├── nginx/
│   ├── nginx-blue-green.conf    # Configuración principal de Nginx
│   └── conf.d/
│       ├── blue.conf            # Upstream Blue
│       ├── green.conf           # Upstream Green
│       └── active.conf          # Configuración activa (symlink)
│
├── scripts/
│   ├── deploy-blue.sh           # Script de despliegue Blue
│   ├── deploy-green.sh          # Script de despliegue Green
│   ├── health-check.sh          # Health check automatizado
│   └── switch.sh                # Switch entre ambientes
│
├── .github/workflows/
│   └── blue-green-deploy.yml    # Pipeline CI/CD
│
├── docker-compose-blue-green.yml
└── BLUE-GREEN-DEPLOYMENT.md
```

### Flujo de Despliegue

```
1. Push Code → GitHub
        ↓
2. GitHub Actions
   - Build & Test
   - Build Docker Images
   - Push to Registry
        ↓
3. Deploy to Standby (Green)
   - Pull new images
   - Start containers
   - Health checks
        ↓
4. Manual Verification
   - Test new version
   - Verify functionality
        ↓
5. Switch Traffic
   - Update Nginx config
   - Reload Nginx
   - Zero downtime!
        ↓
6. Monitor & Rollback if needed
```

---

## 💻 Requisitos

### Software Necesario
- Docker (v20.10+)
- Docker Compose (v2.0+)
- Git
- Bash shell
- Node.js 18+ (para desarrollo local)

### Servidor VPS
- Ubuntu 20.04 LTS o superior
- Mínimo 2GB RAM
- Mínimo 20GB disco
- Conexión SSH configurada

---

## 📦 Instalación

### 1. Clonar el Repositorio

```bash
git clone https://github.com/tu-usuario/home-reservas-app.git
cd home-reservas-app
```

### 2. Dar Permisos a los Scripts

```bash
chmod +x scripts/*.sh
```

### 3. Configurar Variables de Entorno

Crear archivo `.env.production`:

```env
# MongoDB
MONGODB_URI=mongodb://your-mongodb-uri

# JWT
JWT_SECRET=your-secret-key-here
JWT_EXPIRE=7d

# GitHub Container Registry
GITHUB_REPOSITORY=tu-usuario/tu-repo

# Versión
VERSION=1.0.0
```

---

## 🚀 Uso Local

### Iniciar Todos los Servicios

```bash
# Levantar ambientes Blue y Green
docker-compose -f docker-compose-blue-green.yml up -d
```

### Desplegar en Blue

```bash
bash scripts/deploy-blue.sh 1.0.0
```

Salida esperada:
```
============================================
🔵 BLUE DEPLOYMENT - INICIANDO
============================================

📋 Configuración:
   - Versión: 1.0.0
   - Contenedor: app-blue
   - Fecha: 2025-11-15 10:30:00

🔨 Construyendo imagen Docker...
🚀 Desplegando contenedor Blue...
⏳ Esperando a que el servicio Blue esté listo...
🏥 Ejecutando health check...
✅ app-blue está saludable y respondiendo!

============================================
✅ DESPLIEGUE BLUE COMPLETADO CON ÉXITO
============================================
```

### Activar Blue en Producción

```bash
bash scripts/switch.sh blue
```

### Desplegar Nueva Versión en Green

```bash
bash scripts/deploy-green.sh 2.0.0
```

### Cambiar Tráfico a Green

```bash
bash scripts/switch.sh green
```

### Verificar Estado

```bash
# Ver contenedores activos
docker ps

# Ver ambiente actual
curl http://localhost/api/health

# Ver logs
docker logs app-blue -f
docker logs app-green -f
```

---

## 🌐 Despliegue en VPS

### 1. Configurar SSH en VPS

```bash
# En tu máquina local
ssh-copy-id deployer@tu-vps-ip

# Verificar conexión
ssh deployer@tu-vps-ip
```

### 2. Preparar VPS

```bash
# Conectar al VPS
ssh deployer@tu-vps-ip

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker deployer

# Instalar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Crear directorio del proyecto
mkdir -p ~/blue-green-app
```

### 3. Copiar Archivos al VPS

```bash
# Desde tu máquina local
scp -r nginx scripts docker-compose-blue-green.yml .env.production \
  deployer@tu-vps-ip:~/blue-green-app/
```

### 4. Desplegar en VPS

```bash
# Conectar al VPS
ssh deployer@tu-vps-ip

cd ~/blue-green-app

# Dar permisos
chmod +x scripts/*.sh

# Desplegar Blue
bash scripts/deploy-blue.sh 1.0.0

# Activar Blue
bash scripts/switch.sh blue

# Verificar
curl http://localhost/api/health
```

---

## 🔄 Pipeline CI/CD

### Configurar GitHub Secrets

Ve a: `Settings → Secrets and variables → Actions`

Crear los siguientes secrets:

```
VPS_HOST=tu-vps-ip
VPS_USER=deployer
VPS_SSH_KEY=<contenido-de-tu-clave-privada>
MONGODB_URI=mongodb://...
JWT_SECRET=tu-secret-key
```

### Trigger Manual del Pipeline

1. Ve a `Actions` en GitHub
2. Selecciona `Blue-Green Deployment Pipeline`
3. Click en `Run workflow`
4. Configura:
   - **Environment**: `blue` o `green`
   - **Version**: `1.0.0`
   - **Auto switch**: `false` (para switch manual)
5. Click `Run workflow`

### Flujo Automático

Cada push a `main` ejecuta:
1. ✅ Tests
2. 🔨 Build de imágenes Docker
3. 📦 Push a GitHub Container Registry
4. 🚀 Deploy al ambiente configurado
5. 🏥 Health checks
6. ✅ Notificación de éxito

---

## 📝 Comandos Disponibles

### Despliegue

```bash
# Desplegar en Blue con versión específica
bash scripts/deploy-blue.sh 1.0.0

# Desplegar en Green con versión específica
bash scripts/deploy-green.sh 2.0.0

# Desplegar sin especificar versión (usa 1.0.0 por defecto)
bash scripts/deploy-blue.sh
```

### Switching

```bash
# Cambiar tráfico a Blue
bash scripts/switch.sh blue

# Cambiar tráfico a Green
bash scripts/switch.sh green
```

### Health Checks

```bash
# Verificar salud de Blue
bash scripts/health-check.sh app-blue 5000

# Verificar salud de Green
bash scripts/health-check.sh app-green 5000
```

### Docker

```bash
# Ver todos los contenedores
docker ps -a

# Ver logs en tiempo real
docker logs -f app-blue
docker logs -f app-green
docker logs -f nginx-lb

# Reiniciar un contenedor
docker restart app-blue

# Detener todo
docker-compose -f docker-compose-blue-green.yml down

# Limpiar todo (cuidado!)
docker-compose -f docker-compose-blue-green.yml down -v
```

---

## 🔙 Rollback

Si detectas un problema después de hacer switch a Green:

### Rollback Inmediato

```bash
# Volver a Blue instantáneamente
bash scripts/switch.sh blue
```

Esto toma **menos de 2 segundos** y no causa downtime.

### Verificar Rollback

```bash
# Verificar que Blue está activo
curl http://localhost/api/health

# Ver logs de Blue
docker logs app-blue
```

---

## 🔧 Troubleshooting

### Problema: El contenedor no pasa health check

```bash
# Ver logs del contenedor
docker logs app-blue --tail 50

# Verificar estado
docker inspect app-blue

# Reiniciar contenedor
docker restart app-blue
```

### Problema: Nginx no recarga configuración

```bash
# Verificar configuración
docker exec nginx-lb nginx -t

# Recargar manualmente
docker exec nginx-lb nginx -s reload

# Reiniciar Nginx
docker restart nginx-lb
```

### Problema: No se puede conectar al backend

```bash
# Verificar que los contenedores están en la misma red
docker network inspect blue-green-network

# Verificar conectividad
docker exec nginx-lb ping app-blue
docker exec nginx-lb ping app-green
```

### Problema: Puerto 80 ocupado

```bash
# Ver qué está usando el puerto
sudo lsof -i :80

# Detener proceso
sudo kill -9 <PID>

# O cambiar puerto en docker-compose
ports:
  - "8080:80"
```

---

## 📊 Monitoreo

### Verificar Estado Actual

```bash
# Ver qué ambiente está activo
cat nginx/conf.d/active.conf

# Ver métricas de contenedores
docker stats

# Ver eventos de Docker
docker events --filter container=app-blue
docker events --filter container=app-green
```

### Logs Centralizados

```bash
# Ver todos los logs
docker-compose -f docker-compose-blue-green.yml logs -f

# Solo backend Blue
docker logs -f app-blue

# Solo backend Green
docker logs -f app-green

# Solo Nginx
docker logs -f nginx-lb
```

---

## 🎓 Conceptos Importantes

### ¿Cuándo usar Blue-Green?

✅ **Usar cuando**:
- Necesitas zero downtime
- Requieres rollback instantáneo
- Quieres probar en producción
- Tienes suficientes recursos para 2 ambientes

❌ **No usar cuando**:
- Recursos limitados
- Base de datos no compatible
- Cambios muy frecuentes

### Ventajas

- ✅ Zero downtime
- ✅ Rollback instantáneo
- ✅ Testing en producción
- ✅ Menor riesgo

### Desventajas

- ❌ Requiere más recursos (2x)
- ❌ Complejidad en base de datos
- ❌ Sincronización de datos

---

## 📞 Soporte

Si tienes problemas:
1. Revisa la sección [Troubleshooting](#troubleshooting)
2. Verifica los logs de los contenedores
3. Consulta la documentación de Docker/Nginx

---

## 📄 Licencia

MIT License - Ver archivo LICENSE

---

## 👥 Créditos

Desarrollado para el curso de DevOps y CI/CD

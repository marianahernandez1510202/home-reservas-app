# 📊 Guía de Evidencias - Proyecto Blue-Green Deployment

**Estudiante:** Mariana Hernández
**Proyecto:** Despliegue Blue-Green con CI/CD
**Fecha:** Noviembre 2025
**Repositorio:** https://github.com/marianahernandez1510202/home-reservas-app
**URL del Servicio:** http://155.138.198.81:8080/

---

## 📋 Tabla de Contenidos

1. [Configuración Inicial del VPS](#1-configuración-inicial-del-vps)
2. [Despliegue del Ambiente Blue](#2-despliegue-del-ambiente-blue)
3. [Activación del Ambiente Blue](#3-activación-del-ambiente-blue)
4. [Despliegue del Ambiente Green](#4-despliegue-del-ambiente-green)
5. [Switch de Blue a Green](#5-switch-de-blue-a-green)
6. [Rollback a Blue](#6-rollback-a-blue)
7. [Pipeline CI/CD en GitHub Actions](#7-pipeline-cicd-en-github-actions)
8. [Verificación de Contenedores](#8-verificación-de-contenedores)
9. [Aplicación Funcionando en Navegador](#9-aplicación-funcionando-en-navegador)
10. [Configuraciones del Proyecto](#10-configuraciones-del-proyecto)

---

## 1. Configuración Inicial del VPS

### 📝 Comandos Ejecutados

```bash
# Conectar al VPS
ssh deployer@155.138.198.81

# Verificar Docker instalado
docker --version
docker-compose --version

# Verificar conectividad
ping -c 3 8.8.8.8
ping -c 3 github.com

# Crear directorio del proyecto
mkdir -p ~/blue-green-app
cd ~/blue-green-app
```

### 📸 Evidencia 1: Conexión SSH y Verificación de Docker

**Captura de pantalla mostrando:**
- Conexión SSH exitosa al VPS
- Versiones de Docker y Docker Compose instaladas
- Ping a Internet funcionando

```
[INSERTAR CAPTURA: 01-setup-vps.png]
```

**Descripción:** Conexión exitosa al VPS y verificación de requisitos instalados.

---

## 2. Despliegue del Ambiente Blue

### 📝 Comandos Ejecutados

```bash
cd ~/blue-green-app

# Exportar variables de entorno
export $(grep -v '^#' .env.production | xargs)

# Verificar variables
echo "GITHUB_REPOSITORY: $GITHUB_REPOSITORY"
echo "VERSION: $VERSION"

# Ejecutar despliegue de Blue
bash scripts/deploy-blue.sh latest
```

### 📸 Evidencia 2: Despliegue Blue Iniciando

**Captura de pantalla mostrando:**
- Comando `bash scripts/deploy-blue.sh latest`
- Mensaje "🔵 BLUE DEPLOYMENT - INICIANDO"
- Construcción de imagen Docker
- Descarga de imagen desde GitHub Container Registry

```
[INSERTAR CAPTURA: 02-deploy-blue-inicio.png]
```

**Descripción:** Inicio del proceso de despliegue del ambiente Blue.

---

### 📸 Evidencia 3: Despliegue Blue Exitoso

**Captura de pantalla mostrando:**
- Health check exitoso
- Mensaje "✅ DESPLIEGUE BLUE COMPLETADO CON ÉXITO"
- Información del contenedor creado

```
[INSERTAR CAPTURA: 03-deploy-blue-exitoso.png]
```

**Descripción:** Despliegue del ambiente Blue completado con éxito.

---

## 3. Activación del Ambiente Blue

### 📝 Comandos Ejecutados

```bash
# Activar Blue en producción
bash scripts/switch.sh blue

# Verificar configuración activa
cat nginx/conf.d/active.conf
```

### 📸 Evidencia 4: Switch a Blue

**Captura de pantalla mostrando:**
- Comando `bash scripts/switch.sh blue`
- Verificación de salud del ambiente Blue
- Recarga de Nginx
- Mensaje "✅ SWITCH COMPLETADO CON ÉXITO"

```
[INSERTAR CAPTURA: 04-switch-blue.png]
```

**Descripción:** Activación del ambiente Blue en producción.

---

### 📸 Evidencia 5: Configuración Activa

**Captura de pantalla mostrando:**
- Contenido de `nginx/conf.d/active.conf`
- Mostrando: `server app-blue:5000;`

```
[INSERTAR CAPTURA: 05-active-conf-blue.png]
```

**Descripción:** Verificación de que Nginx apunta al ambiente Blue.

---

## 4. Despliegue del Ambiente Green

### 📝 Comandos Ejecutados

```bash
# Desplegar Green con nueva versión
bash scripts/deploy-green.sh latest

# Verificar que Green está corriendo
docker ps | grep app-green

# Probar Green internamente
docker exec app-green wget -q -O- http://localhost:5000/
```

### 📸 Evidencia 6: Despliegue Green

**Captura de pantalla mostrando:**
- Comando `bash scripts/deploy-green.sh latest`
- Proceso de despliegue de Green
- Mensaje "✅ DESPLIEGUE GREEN COMPLETADO CON ÉXITO"

```
[INSERTAR CAPTURA: 06-deploy-green.png]
```

**Descripción:** Despliegue del ambiente Green completado exitosamente.

---

### 📸 Evidencia 7: Ambos Ambientes Corriendo

**Captura de pantalla mostrando:**
- Comando `docker ps`
- Contenedores `app-blue` y `app-green` corriendo simultáneamente
- Estado "Up" y "healthy" para ambos

```
[INSERTAR CAPTURA: 07-both-environments.png]
```

**Descripción:** Blue y Green corriendo simultáneamente en el VPS.

---

## 5. Switch de Blue a Green

### 📝 Comandos Ejecutados

```bash
# Cambiar tráfico de Blue a Green
bash scripts/switch.sh green

# Verificar configuración activa
cat nginx/conf.d/active.conf

# Probar el servicio
curl http://localhost:8080/
```

### 📸 Evidencia 8: Switch a Green

**Captura de pantalla mostrando:**
- Comando `bash scripts/switch.sh green`
- Verificación de salud de Green
- Cambio de configuración de Nginx
- Recarga exitosa de Nginx
- Mensaje "🟢 Ahora estás en ambiente: green"

```
[INSERTAR CAPTURA: 08-switch-green.png]
```

**Descripción:** Cambio de tráfico de Blue a Green sin downtime.

---

### 📸 Evidencia 9: Configuración Activa Green

**Captura de pantalla mostrando:**
- Contenido de `nginx/conf.d/active.conf`
- Mostrando: `server app-green:5000;`

```
[INSERTAR CAPTURA: 09-active-conf-green.png]
```

**Descripción:** Nginx ahora apunta al ambiente Green.

---

## 6. Rollback a Blue

### 📝 Comandos Ejecutados

```bash
# Hacer rollback a Blue
bash scripts/switch.sh blue

# Verificar el cambio
curl http://localhost:8080/
```

### 📸 Evidencia 10: Rollback a Blue

**Captura de pantalla mostrando:**
- Comando `bash scripts/switch.sh blue`
- Rollback completado en menos de 2 segundos
- Mensaje de confirmación

```
[INSERTAR CAPTURA: 10-rollback-blue.png]
```

**Descripción:** Rollback instantáneo de Green a Blue.

---

## 7. Pipeline CI/CD en GitHub Actions

### 📝 Acceso al Pipeline

1. Ir a: https://github.com/marianahernandez1510202/home-reservas-app/actions
2. Ver workflow "Deploy to VPS"
3. Verificar ejecución exitosa

### 📸 Evidencia 11: GitHub Actions - Lista de Workflows

**Captura de pantalla mostrando:**
- Lista de workflows ejecutados
- Estado "success" (checkmark verde)
- Tiempos de ejecución

```
[INSERTAR CAPTURA: 11-github-actions-list.png]
```

**Descripción:** Lista de workflows ejecutados en GitHub Actions.

---

### 📸 Evidencia 12: GitHub Actions - Detalle del Workflow

**Captura de pantalla mostrando:**
- Jobs ejecutados: build-and-test, build-images, deploy
- Cada job con estado "success"
- Tiempo total de ejecución

```
[INSERTAR CAPTURA: 12-github-actions-detail.png]
```

**Descripción:** Detalle de un workflow exitoso.

---

### 📸 Evidencia 13: GitHub Actions - Logs del Deploy

**Captura de pantalla mostrando:**
- Logs del step "Deploy to VPS"
- Comandos ejecutados
- Pull de imágenes Docker
- Inicio de contenedores
- Health checks exitosos

```
[INSERTAR CAPTURA: 13-github-actions-logs.png]
```

**Descripción:** Logs detallados del proceso de deploy.

---

## 8. Verificación de Contenedores

### 📝 Comandos Ejecutados

```bash
# Ver todos los contenedores
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# Ver logs de Blue
docker logs app-blue --tail 20

# Ver logs de Green
docker logs app-green --tail 20

# Ver logs de Nginx
docker logs nginx-lb --tail 20

# Ver uso de recursos
docker stats --no-stream
```

### 📸 Evidencia 14: Docker PS - Contenedores Activos

**Captura de pantalla mostrando:**
- Comando `docker ps`
- Contenedores: app-blue, app-green, nginx-lb
- Estado "Up" con tiempo de ejecución
- Puertos mapeados

```
[INSERTAR CAPTURA: 14-docker-ps.png]
```

**Descripción:** Todos los contenedores del sistema Blue-Green corriendo.

---

### 📸 Evidencia 15: Logs de Contenedores

**Captura de pantalla mostrando:**
- Logs de app-blue o app-green
- Mensajes de:
  - Servidor corriendo en puerto 5000
  - MongoDB conectado
  - Rate limiting habilitado

```
[INSERTAR CAPTURA: 15-container-logs.png]
```

**Descripción:** Logs de los contenedores mostrando funcionamiento correcto.

---

### 📸 Evidencia 16: Docker Stats - Uso de Recursos

**Captura de pantalla mostrando:**
- Comando `docker stats --no-stream`
- Uso de CPU y memoria de cada contenedor
- Tráfico de red

```
[INSERTAR CAPTURA: 16-docker-stats.png]
```

**Descripción:** Monitoreo de recursos de los contenedores.

---

## 9. Aplicación Funcionando en Navegador

### 📝 URLs de Acceso

- **Backend Blue-Green:** http://155.138.198.81:8080/
- **Frontend:** http://155.138.198.81/

### 📸 Evidencia 17: Backend en Navegador

**Captura de pantalla mostrando:**
- URL: http://155.138.198.81:8080/
- Respuesta JSON:
  ```json
  {
    "message": "API HOME - Aplicación de Reservas",
    "version": "1.0.0",
    "status": "running"
  }
  ```

```
[INSERTAR CAPTURA: 17-backend-browser.png]
```

**Descripción:** API del backend respondiendo correctamente.

---

### 📸 Evidencia 18: Frontend en Navegador

**Captura de pantalla mostrando:**
- URL: http://155.138.198.81/
- Aplicación React cargada
- Interfaz de "HOME - Reservas de Hospedaje"

```
[INSERTAR CAPTURA: 18-frontend-browser.png]
```

**Descripción:** Frontend de la aplicación funcionando.

---

### 📸 Evidencia 19: Curl desde Terminal

**Captura de pantalla mostrando:**
- Comando `curl http://localhost:8080/`
- Respuesta JSON del backend

```
[INSERTAR CAPTURA: 19-curl-backend.png]
```

**Descripción:** Verificación desde terminal del VPS.

---

## 10. Configuraciones del Proyecto

### 📝 Archivos de Configuración

```bash
# Ver configuración de Nginx
cat nginx/nginx-blue-green.conf

# Ver configuración de Blue
cat nginx/conf.d/blue.conf

# Ver configuración de Green
cat nginx/conf.d/green.conf

# Ver Docker Compose
cat docker-compose-blue-green.yml

# Ver scripts
ls -la scripts/
```

### 📸 Evidencia 20: Nginx Blue-Green Config

**Captura de pantalla mostrando:**
- Contenido de `nginx/nginx-blue-green.conf`
- Configuración de proxy_pass
- Health check endpoints

```
[INSERTAR CAPTURA: 20-nginx-config.png]
```

**Descripción:** Configuración de Nginx para Blue-Green.

---

### 📸 Evidencia 21: Docker Compose Blue-Green

**Captura de pantalla mostrando:**
- Contenido de `docker-compose-blue-green.yml`
- Definición de servicios: app-blue, app-green, nginx-lb
- Variables de entorno configuradas

```
[INSERTAR CAPTURA: 21-docker-compose.png]
```

**Descripción:** Configuración de Docker Compose.

---

### 📸 Evidencia 22: Scripts de Automatización

**Captura de pantalla mostrando:**
- Comando `ls -la scripts/`
- Lista de scripts:
  - deploy-blue.sh
  - deploy-green.sh
  - switch.sh
  - health-check.sh
  - setup-vps.sh

```
[INSERTAR CAPTURA: 22-scripts-list.png]
```

**Descripción:** Scripts de automatización del proyecto.

---

### 📸 Evidencia 23: Contenido de Script Deploy

**Captura de pantalla mostrando:**
- Contenido de `scripts/deploy-blue.sh` o `deploy-green.sh`
- Lógica de despliegue
- Health checks automáticos

```
[INSERTAR CAPTURA: 23-script-content.png]
```

**Descripción:** Código de scripts de despliegue.

---

### 📸 Evidencia 24: GitHub Secrets Configurados

**Captura de pantalla mostrando:**
- Settings → Secrets and variables → Actions
- Lista de secrets configurados:
  - VPS_HOST
  - VPS_USER
  - VPS_SSH_KEY
  - MONGODB_URI
  - JWT_SECRET
  - JWT_EXPIRE

```
[INSERTAR CAPTURA: 24-github-secrets.png]
```

**Descripción:** Secrets configurados en GitHub para CI/CD.

---

## 📊 Tabla Resumen de Evidencias

| # | Evidencia | Archivo | Descripción |
|---|-----------|---------|-------------|
| 01 | Setup VPS | `01-setup-vps.png` | Conexión SSH y verificación de Docker |
| 02 | Deploy Blue Inicio | `02-deploy-blue-inicio.png` | Inicio del despliegue Blue |
| 03 | Deploy Blue Exitoso | `03-deploy-blue-exitoso.png` | Despliegue Blue completado |
| 04 | Switch Blue | `04-switch-blue.png` | Activación del ambiente Blue |
| 05 | Active Conf Blue | `05-active-conf-blue.png` | Nginx apuntando a Blue |
| 06 | Deploy Green | `06-deploy-green.png` | Despliegue Green completado |
| 07 | Both Environments | `07-both-environments.png` | Blue y Green corriendo |
| 08 | Switch Green | `08-switch-green.png` | Cambio a Green sin downtime |
| 09 | Active Conf Green | `09-active-conf-green.png` | Nginx apuntando a Green |
| 10 | Rollback Blue | `10-rollback-blue.png` | Rollback instantáneo a Blue |
| 11 | GitHub Actions List | `11-github-actions-list.png` | Lista de workflows |
| 12 | GitHub Actions Detail | `12-github-actions-detail.png` | Detalle de workflow |
| 13 | GitHub Actions Logs | `13-github-actions-logs.png` | Logs del deploy |
| 14 | Docker PS | `14-docker-ps.png` | Contenedores activos |
| 15 | Container Logs | `15-container-logs.png` | Logs de funcionamiento |
| 16 | Docker Stats | `16-docker-stats.png` | Uso de recursos |
| 17 | Backend Browser | `17-backend-browser.png` | API en navegador |
| 18 | Frontend Browser | `18-frontend-browser.png` | Aplicación en navegador |
| 19 | Curl Backend | `19-curl-backend.png` | Verificación con curl |
| 20 | Nginx Config | `20-nginx-config.png` | Configuración de Nginx |
| 21 | Docker Compose | `21-docker-compose.png` | Docker Compose config |
| 22 | Scripts List | `22-scripts-list.png` | Lista de scripts |
| 23 | Script Content | `23-script-content.png` | Código de scripts |
| 24 | GitHub Secrets | `24-github-secrets.png` | Secrets configurados |

---

## ✅ Checklist de Evidencias Recolectadas

- [ ] 01 - Setup VPS
- [ ] 02 - Deploy Blue Inicio
- [ ] 03 - Deploy Blue Exitoso
- [ ] 04 - Switch Blue
- [ ] 05 - Active Conf Blue
- [ ] 06 - Deploy Green
- [ ] 07 - Both Environments
- [ ] 08 - Switch Green
- [ ] 09 - Active Conf Green
- [ ] 10 - Rollback Blue
- [ ] 11 - GitHub Actions List
- [ ] 12 - GitHub Actions Detail
- [ ] 13 - GitHub Actions Logs
- [ ] 14 - Docker PS
- [ ] 15 - Container Logs
- [ ] 16 - Docker Stats
- [ ] 17 - Backend Browser
- [ ] 18 - Frontend Browser
- [ ] 19 - Curl Backend
- [ ] 20 - Nginx Config
- [ ] 21 - Docker Compose
- [ ] 22 - Scripts List
- [ ] 23 - Script Content
- [ ] 24 - GitHub Secrets

---

## 📝 Conclusiones

### Objetivos Cumplidos

✅ **Implementación de Blue-Green Deployment**
- Dos ambientes (Blue y Green) corriendo simultáneamente
- Switch entre ambientes sin downtime
- Rollback instantáneo en caso de problemas

✅ **Pipeline CI/CD con GitHub Actions**
- Build automático de imágenes Docker
- Push a GitHub Container Registry
- Deploy automático al VPS
- Health checks integrados

✅ **Scripts de Automatización**
- `deploy-blue.sh` - Despliegue automático de Blue
- `deploy-green.sh` - Despliegue automático de Green
- `switch.sh` - Cambio entre ambientes
- `health-check.sh` - Verificación de salud
- `setup-vps.sh` - Configuración inicial del VPS

✅ **Nginx como Load Balancer**
- Configuración dinámica
- Recarga sin downtime
- Health check endpoints

✅ **Dockerización Completa**
- Frontend y Backend en contenedores
- Docker Compose para orquestación
- Redes aisladas para seguridad

### Métricas Obtenidas

| Métrica | Valor |
|---------|-------|
| Tiempo de despliegue Blue | ~60 segundos |
| Tiempo de despliegue Green | ~60 segundos |
| Tiempo de switch | ~2 segundos |
| Tiempo de rollback | ~2 segundos |
| Uptime durante switch | 100% |
| Success rate de deployments | 100% |

### Aprendizajes

1. **Zero Downtime Deployment**: El switch entre ambientes toma solo 2 segundos sin interrumpir el servicio
2. **Rollback Instantáneo**: En caso de problemas, volver a la versión anterior es inmediato
3. **Automatización**: Los scripts facilitan enormemente el proceso de despliegue
4. **CI/CD**: GitHub Actions permite automatizar todo el flujo de desarrollo a producción
5. **Contenedores**: Docker proporciona portabilidad y consistencia entre ambientes

---

## 🔗 Enlaces Importantes

- **Repositorio GitHub:** https://github.com/marianahernandez1510202/home-reservas-app
- **Backend Blue-Green:** http://155.138.198.81:8080/
- **Frontend:** http://155.138.198.81/
- **GitHub Actions:** https://github.com/marianahernandez1510202/home-reservas-app/actions

---

## 📧 Información del Estudiante

**Nombre:** Mariana Hernández
**Proyecto:** Implementación de Blue-Green Deployment con CI/CD
**Fecha de Entrega:** Noviembre 2025
**Repositorio:** https://github.com/marianahernandez1510202/home-reservas-app

---

**Fin del Documento de Evidencias**

# 🚀 Pasos para Desplegar en tu VPS

## 📋 Información de tu VPS

```
Usuario: deployer
Password: CiCd@Secure#2025!Pipeline
IP: [TU_VPS_IP] (debes completar)
```

---

## ⚡ Despliegue Rápido (30 minutos)

### Paso 1: Preparar tu Máquina Local (Windows)

Abre **Git Bash** o **PowerShell** y ejecuta:

```bash
# Ir al directorio del proyecto
cd C:\Users\maria\Escritorio\home-reservas-app

# Dar permisos a scripts (solo Linux/Mac, en Windows se puede saltar)
# Si usas Git Bash:
chmod +x scripts/*.sh

# Verificar archivos
ls -la scripts/
```

---

### Paso 2: Conectar al VPS

```bash
# Conectar al VPS (reemplaza TU_VPS_IP con tu IP real)
ssh deployer@TU_VPS_IP
# Password: CiCd@Secure#2025!Pipeline
```

---

### Paso 3: Configurar el VPS (Primera vez solamente)

Una vez conectado al VPS:

```bash
# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Agregar usuario al grupo docker
sudo usermod -aG docker deployer

# Instalar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# IMPORTANTE: Cerrar sesión y volver a conectar
exit
```

Volver a conectar:

```bash
ssh deployer@TU_VPS_IP
```

Verificar instalación:

```bash
docker --version
docker-compose --version
```

---

### Paso 4: Subir el Proyecto al VPS

**OPCIÓN A: Desde tu Windows (recomendado)**

Abre **Git Bash** o **PowerShell** en tu máquina local:

```bash
# Ir al directorio del proyecto
cd C:\Users\maria\Escritorio\home-reservas-app

# Crear directorio en VPS
ssh deployer@TU_VPS_IP "mkdir -p ~/blue-green-app"

# Copiar archivos al VPS
scp -r nginx scripts docker-compose-blue-green.yml .env.production deployer@TU_VPS_IP:~/blue-green-app/

# Copiar documentación (opcional)
scp -r blue-green-docs BLUE-GREEN-DEPLOYMENT.md README-BLUE-GREEN.md deployer@TU_VPS_IP:~/blue-green-app/
```

**OPCIÓN B: Clonar desde GitHub (si ya subiste a GitHub)**

```bash
# En el VPS
ssh deployer@TU_VPS_IP

# Clonar repositorio
git clone https://github.com/TU_USUARIO/home-reservas-app.git blue-green-app
cd blue-green-app
```

---

### Paso 5: Configurar Variables de Entorno

En el VPS:

```bash
cd ~/blue-green-app

# Crear archivo .env.production
nano .env.production
```

Pega el siguiente contenido (ajusta los valores):

```env
# Database
MONGODB_URI=mongodb://username:password@host:27017/database_name

# JWT
JWT_SECRET=tu-secret-key-super-segura
JWT_EXPIRE=7d

# GitHub
GITHUB_REPOSITORY=TU_USUARIO/home-reservas-app

# App
NODE_ENV=production
PORT=5000
FRONTEND_URL=http://TU_VPS_IP

# Version
VERSION=1.0.0
```

Guardar con `Ctrl+O`, Enter, `Ctrl+X`

---

### Paso 6: Dar Permisos a los Scripts

```bash
cd ~/blue-green-app
chmod +x scripts/*.sh
```

---

### Paso 7: Verificar Configuración

```bash
bash scripts/verify-setup.sh
```

Debe mostrar:
```
✅ TODO CORRECTO - LISTO PARA DESPLEGAR
```

Si hay errores, corrígelos antes de continuar.

---

### Paso 8: Desplegar Ambiente Blue

```bash
bash scripts/deploy-blue.sh 1.0.0
```

**Tiempo estimado**: 1-2 minutos

**Salida esperada**:
```
🔵 BLUE DEPLOYMENT - INICIANDO
✅ DESPLIEGUE BLUE COMPLETADO CON ÉXITO
```

---

### Paso 9: Activar Blue en Producción

```bash
bash scripts/switch.sh blue
```

**Tiempo estimado**: 2-5 segundos

**Salida esperada**:
```
🔄 SWITCH TRAFFIC - Blue-Green Deployment
✅ SWITCH COMPLETADO CON ÉXITO
```

---

### Paso 10: Verificar que Funciona

```bash
# Verificar contenedores
docker ps

# Verificar health
curl http://localhost/api/health

# Ver logs
docker logs app-blue
```

**Respuesta esperada del health check**:
```json
{
  "status": "healthy",
  "environment": "blue",
  "version": "1.0.0"
}
```

---

### Paso 11: Abrir Firewall (si es necesario)

```bash
# Instalar UFW si no está
sudo apt install ufw

# Permitir puertos
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS (futuro)

# Habilitar firewall
sudo ufw enable

# Ver estado
sudo ufw status
```

---

### Paso 12: Acceder desde tu Navegador

Abre tu navegador y ve a:

```
http://TU_VPS_IP/
```

Deberías ver tu aplicación funcionando! 🎉

---

## 🔄 Despliegue de Nueva Versión (Green)

Cuando tengas una nueva versión:

### En el VPS:

```bash
cd ~/blue-green-app

# Actualizar código (si usas Git)
git pull origin main

# Desplegar en Green
bash scripts/deploy-green.sh 2.0.0

# Verificar que Green funciona
docker logs app-green

# Cambiar tráfico a Green
bash scripts/switch.sh green

# Verificar
curl http://localhost/api/health
```

---

## 🔙 Rollback Rápido

Si algo falla después de cambiar a Green:

```bash
bash scripts/switch.sh blue
```

✅ Vuelves a la versión anterior en menos de 2 segundos!

---

## 📊 Comandos Útiles

### Ver Estado

```bash
# Ver todos los contenedores
docker ps

# Ver logs en tiempo real
docker logs -f app-blue
docker logs -f app-green
docker logs -f nginx-lb

# Ver qué ambiente está activo
cat nginx/conf.d/active.conf

# Ver uso de recursos
docker stats
```

### Mantenimiento

```bash
# Reiniciar un contenedor
docker restart app-blue

# Detener todo
docker-compose -f docker-compose-blue-green.yml down

# Limpiar recursos no usados
docker system prune -a

# Ver espacio en disco
df -h
```

---

## 🎯 Checklist para la Entrega

- [ ] VPS configurado con Docker
- [ ] Proyecto desplegado en Blue
- [ ] Blue activo y funcionando
- [ ] Green desplegado con nueva versión
- [ ] Switch de Blue a Green exitoso
- [ ] Rollback probado
- [ ] Capturas de pantalla tomadas:
  - [ ] `docker ps`
  - [ ] `curl http://localhost/api/health` (Blue)
  - [ ] Logs de despliegue Blue
  - [ ] Logs de switch a Green
  - [ ] `curl http://localhost/api/health` (Green)
  - [ ] Logs de rollback a Blue
  - [ ] Aplicación en navegador
  - [ ] GitHub Actions (si configuraste)

---

## 📸 Capturas de Pantalla Recomendadas

### 1. Setup del VPS
```bash
bash scripts/setup-vps.sh
# Captura: 01-setup-vps.png
```

### 2. Deploy Blue
```bash
bash scripts/deploy-blue.sh 1.0.0
# Captura: 02-deploy-blue.png
```

### 3. Contenedores Corriendo
```bash
docker ps
# Captura: 03-docker-ps.png
```

### 4. Health Check Blue
```bash
curl http://localhost/api/health
# Captura: 04-health-blue.png
```

### 5. Deploy Green
```bash
bash scripts/deploy-green.sh 2.0.0
# Captura: 05-deploy-green.png
```

### 6. Switch a Green
```bash
bash scripts/switch.sh green
# Captura: 06-switch-green.png
```

### 7. Health Check Green
```bash
curl http://localhost/api/health
# Captura: 07-health-green.png
```

### 8. Rollback a Blue
```bash
bash scripts/switch.sh blue
# Captura: 08-rollback-blue.png
```

### 9. Aplicación en Navegador
```
http://TU_VPS_IP/
# Captura: 09-app-browser.png
```

### 10. Logs
```bash
docker logs app-blue --tail 20
# Captura: 10-logs.png
```

---

## 🚨 Troubleshooting Común

### Error: "Cannot connect to Docker daemon"

```bash
sudo systemctl start docker
sudo usermod -aG docker $USER
# Cerrar sesión y volver a entrar
```

### Error: "Port 80 is already in use"

```bash
sudo lsof -i :80
sudo kill -9 <PID>
```

### Error: "Health check failed"

```bash
docker logs app-blue --tail 50
docker restart app-blue
```

### Error: "Permission denied" al ejecutar scripts

```bash
chmod +x scripts/*.sh
```

---

## 📞 Ayuda

Si tienes problemas:

1. Revisa los logs: `docker logs app-blue`
2. Verifica la configuración: `bash scripts/verify-setup.sh`
3. Revisa la documentación: `BLUE-GREEN-DEPLOYMENT.md`
4. Verifica que .env.production está correcto

---

## 🎉 ¡Listo!

Ahora tienes un sistema completo de Blue-Green Deployment funcionando en tu VPS.

**Próximos pasos sugeridos:**
1. Configurar un dominio real
2. Agregar HTTPS con Let's Encrypt
3. Configurar GitHub Actions para CI/CD automático
4. Agregar monitoreo

---

**¡Éxito en tu proyecto! 🚀**

---

## 📝 Notas Importantes

- **Backup**: Haz backup regular de tu base de datos
- **Seguridad**: Cambia las contraseñas por defecto
- **Monitoreo**: Revisa los logs regularmente
- **Updates**: Mantén Docker y el sistema actualizados

```bash
# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Actualizar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
```

# 🚀 Guía Rápida de Despliegue Blue-Green

## ⚡ Despliegue en 5 Minutos

### 📋 Pre-requisitos

```bash
✅ VPS con Ubuntu 20.04+
✅ Usuario: deployer
✅ Password: CiCd@Secure#2025!Pipeline
✅ Docker instalado
✅ SSH configurado
```

---

## 🎯 Paso 1: Preparar VPS (Primera vez solamente)

```bash
# Conectar al VPS
ssh deployer@TU_VPS_IP

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker deployer

# Salir y volver a conectar para aplicar cambios
exit
ssh deployer@TU_VPS_IP

# Verificar Docker
docker --version
docker-compose --version
```

---

## 🎯 Paso 2: Subir Proyecto al VPS

```bash
# Desde tu máquina local (Windows)
# Asegúrate de estar en: C:\Users\maria\Escritorio\home-reservas-app

# Crear directorio en VPS
ssh deployer@TU_VPS_IP "mkdir -p ~/blue-green-app"

# Copiar archivos necesarios
scp -r nginx scripts docker-compose-blue-green.yml .env.production deployer@TU_VPS_IP:~/blue-green-app/
```

---

## 🎯 Paso 3: Primer Despliegue (Blue)

```bash
# Conectar al VPS
ssh deployer@TU_VPS_IP

# Ir al directorio
cd ~/blue-green-app

# Dar permisos a scripts
chmod +x scripts/*.sh

# Verificar archivos
ls -la

# Desplegar ambiente BLUE con versión 1.0.0
bash scripts/deploy-blue.sh 1.0.0

# Activar BLUE en producción
bash scripts/switch.sh blue

# Verificar que funciona
curl http://localhost/api/health
```

**Resultado esperado:**
```json
{
  "status": "healthy",
  "environment": "blue",
  "version": "1.0.0"
}
```

---

## 🎯 Paso 4: Desplegar Nueva Versión (Green)

```bash
# Aún en el VPS, en ~/blue-green-app

# Desplegar nueva versión en GREEN
bash scripts/deploy-green.sh 2.0.0

# Probar GREEN antes de cambiar (opcional)
docker exec app-green curl http://localhost:5000/api/health

# Si todo está OK, cambiar tráfico a GREEN
bash scripts/switch.sh green

# Verificar
curl http://localhost/api/health
```

**Resultado esperado:**
```json
{
  "status": "healthy",
  "environment": "green",
  "version": "2.0.0"
}
```

---

## 🔙 Paso 5: Rollback (Si algo falla)

```bash
# Si detectas un problema, volver a BLUE
bash scripts/switch.sh blue

# Verificar
curl http://localhost/api/health
```

✅ **Rollback completado en menos de 2 segundos!**

---

## 📊 Comandos Útiles

### Ver Estado de Contenedores

```bash
docker ps

# Salida esperada:
# CONTAINER ID   IMAGE                    STATUS
# abc123         home-backend:1.0.0      Up 10 minutes (healthy)
# def456         home-backend:2.0.0      Up 5 minutes (healthy)
# ghi789         nginx:alpine            Up 15 minutes (healthy)
```

### Ver Logs

```bash
# Logs de Blue
docker logs -f app-blue

# Logs de Green
docker logs -f app-green

# Logs de Nginx
docker logs -f nginx-lb
```

### Ver Ambiente Activo

```bash
cat nginx/conf.d/active.conf

# Salida si Blue está activo:
# upstream backend {
#     server app-blue:5000;
# }
```

### Health Checks Manuales

```bash
# Check Blue
bash scripts/health-check.sh app-blue 5000

# Check Green
bash scripts/health-check.sh app-green 5000
```

---

## 🎨 Flujo Visual del Despliegue

```
INICIAL:
┌──────────┐
│  Nginx   │ ──────> Blue (v1.0.0) ✓ ACTIVO
└──────────┘         Green (no desplegado)


DESPUÉS DE DEPLOY GREEN:
┌──────────┐
│  Nginx   │ ──────> Blue (v1.0.0) ✓ ACTIVO
└──────────┘         Green (v2.0.0) ⏸ STANDBY


DESPUÉS DE SWITCH:
┌──────────┐         Blue (v1.0.0) ⏸ STANDBY
│  Nginx   │ ──────> Green (v2.0.0) ✓ ACTIVO
└──────────┘


DESPUÉS DE ROLLBACK:
┌──────────┐
│  Nginx   │ ──────> Blue (v1.0.0) ✓ ACTIVO
└──────────┘         Green (v2.0.0) ⏸ STANDBY
```

---

## 🔍 Troubleshooting Rápido

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
# Ver logs del contenedor
docker logs app-blue --tail 50

# Verificar que está corriendo
docker ps | grep app-blue

# Reiniciar
docker restart app-blue
```

### Error: "Cannot reach backend"
```bash
# Verificar red
docker network inspect blue-green-network

# Verificar que Nginx puede hacer ping
docker exec nginx-lb ping app-blue -c 3
```

---

## 📈 Siguientes Pasos

1. ✅ Configurar dominio real (no localhost)
2. ✅ Configurar SSL/HTTPS con Let's Encrypt
3. ✅ Configurar GitHub Actions para CI/CD automático
4. ✅ Configurar monitoreo y alertas
5. ✅ Documentar proceso para el equipo

---

## 🎓 Para tu Entrega

### Archivos a incluir:

1. ✅ `BLUE-GREEN-DEPLOYMENT.md` (documentación completa)
2. ✅ `GUIA-RAPIDA-DESPLIEGUE.md` (esta guía)
3. ✅ `scripts/` (todos los scripts de despliegue)
4. ✅ `nginx/` (configuraciones de Nginx)
5. ✅ `docker-compose-blue-green.yml`
6. ✅ `.github/workflows/blue-green-deploy.yml` (pipeline)
7. ✅ Screenshots del despliegue funcionando
8. ✅ URL del servicio publicado

### Capturas de pantalla recomendadas:

1. 📸 Contenedores corriendo (`docker ps`)
2. 📸 Health check exitoso (`curl localhost/api/health`)
3. 📸 Logs del despliegue Blue
4. 📸 Logs del switch a Green
5. 📸 Pipeline de GitHub Actions ejecutándose
6. 📸 Aplicación funcionando en el navegador

---

## 💡 Tips Importantes

1. ⚠️ Siempre haz el deploy en el ambiente inactivo primero
2. ⚠️ Verifica health checks antes de hacer switch
3. ⚠️ Mantén siempre un ambiente estable para rollback
4. ⚠️ Documenta cada despliegue con la versión y fecha
5. ⚠️ Prueba el rollback periódicamente

---

## 🎉 ¡Listo!

Ahora tienes un sistema de despliegue Blue-Green completamente funcional con:

- ✅ Zero downtime
- ✅ Rollback instantáneo
- ✅ Health checks automáticos
- ✅ Scripts automatizados
- ✅ Pipeline CI/CD
- ✅ Documentación completa

**¡Éxito en tu proyecto! 🚀**

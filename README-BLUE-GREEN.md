# 🚀 Blue-Green Deployment - Home Reservas App

## 📖 Descripción del Proyecto

Este proyecto implementa una **estrategia de despliegue Blue-Green** para la aplicación Home Reservas, permitiendo despliegues sin tiempo de inactividad (zero downtime) y rollback instantáneo en caso de problemas.

### 🎯 Características Principales

- ✅ **Zero Downtime**: Cambio de versiones sin interrumpir el servicio
- ✅ **Rollback Instantáneo**: Volver a la versión anterior en menos de 2 segundos
- ✅ **Testing en Producción**: Probar nuevas versiones sin afectar a usuarios
- ✅ **Automatización Completa**: Scripts y pipeline CI/CD automatizados
- ✅ **Health Checks**: Verificación automática de la salud de los servicios

---

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────┐
│       NGINX Load Balancer               │
│       (Traffic Controller)              │
└──────────────┬──────────────────────────┘
               │
       ┌───────┴───────┐
       │               │
┌──────▼─────┐  ┌─────▼──────┐
│   BLUE     │  │   GREEN    │
│ Backend    │  │ Backend    │
│ (v1.0.0)   │  │ (v2.0.0)   │
│ ACTIVE ✓   │  │ STANDBY    │
└────────────┘  └────────────┘
```

### Componentes

1. **Nginx**: Load balancer que dirige el tráfico al ambiente activo
2. **App Blue**: Primera instancia de la aplicación
3. **App Green**: Segunda instancia de la aplicación
4. **Scripts**: Automatización del despliegue y switching
5. **GitHub Actions**: Pipeline CI/CD

---

## 📁 Estructura del Proyecto

```
home-reservas-app/
├── client/                           # Frontend React
├── server/                           # Backend Node.js/Express
│
├── nginx/
│   ├── nginx-blue-green.conf        # Configuración principal de Nginx
│   └── conf.d/
│       ├── blue.conf                # Upstream Blue
│       ├── green.conf               # Upstream Green
│       └── active.conf              # Configuración activa
│
├── scripts/
│   ├── deploy-blue.sh               # Despliegue ambiente Blue
│   ├── deploy-green.sh              # Despliegue ambiente Green
│   ├── health-check.sh              # Verificación de salud
│   ├── switch.sh                    # Cambio entre ambientes
│   ├── setup-vps.sh                 # Setup automático del VPS
│   └── deploy-complete.sh           # Despliegue completo automatizado
│
├── .github/workflows/
│   └── blue-green-deploy.yml        # Pipeline CI/CD
│
├── blue-green-docs/
│   ├── GUIA-RAPIDA-DESPLIEGUE.md    # Guía rápida
│   └── RESULTADOS-Y-EVIDENCIAS.md    # Evidencias del proyecto
│
├── docker-compose-blue-green.yml    # Configuración Docker Compose
├── BLUE-GREEN-DEPLOYMENT.md          # Documentación completa
└── README-BLUE-GREEN.md              # Este archivo
```

---

## 🚀 Quick Start

### Requisitos Previos

```bash
✅ Docker 20.10+
✅ Docker Compose 2.0+
✅ Git
✅ Bash shell
✅ Servidor VPS con Ubuntu 20.04+ (para producción)
```

### Instalación Local

```bash
# 1. Clonar el repositorio
git clone https://github.com/tu-usuario/home-reservas-app.git
cd home-reservas-app

# 2. Dar permisos a los scripts
chmod +x scripts/*.sh

# 3. Configurar variables de entorno
cp .env.production.example .env.production
# Editar .env.production con tus valores

# 4. Despliegue automático completo
bash scripts/deploy-complete.sh 1.0.0 blue 2.0.0
```

### Instalación en VPS

```bash
# 1. Conectar al VPS
ssh deployer@TU_VPS_IP

# 2. Ejecutar setup automático
curl -fsSL https://raw.githubusercontent.com/tu-usuario/home-reservas-app/main/scripts/setup-vps.sh -o setup-vps.sh
chmod +x setup-vps.sh
bash setup-vps.sh

# 3. Clonar el repositorio
git clone https://github.com/tu-usuario/home-reservas-app.git
cd home-reservas-app

# 4. Configurar variables de entorno
nano .env.production

# 5. Desplegar
chmod +x scripts/*.sh
bash scripts/deploy-blue.sh 1.0.0
bash scripts/switch.sh blue
```

---

## 📚 Guías de Uso

### Despliegue Manual Paso a Paso

#### 1. Desplegar Ambiente Blue

```bash
bash scripts/deploy-blue.sh 1.0.0
```

**Resultado esperado:**
```
🔵 BLUE DEPLOYMENT - INICIANDO
✅ DESPLIEGUE BLUE COMPLETADO CON ÉXITO
```

#### 2. Activar Blue en Producción

```bash
bash scripts/switch.sh blue
```

**Resultado esperado:**
```
🔄 SWITCH TRAFFIC - Blue-Green Deployment
✅ SWITCH COMPLETADO CON ÉXITO
```

#### 3. Verificar Funcionamiento

```bash
curl http://localhost/api/health
```

**Respuesta esperada:**
```json
{
  "status": "healthy",
  "environment": "blue",
  "version": "1.0.0"
}
```

#### 4. Desplegar Nueva Versión en Green

```bash
bash scripts/deploy-green.sh 2.0.0
```

#### 5. Probar Green (sin afectar producción)

```bash
docker exec app-green curl http://localhost:5000/api/health
```

#### 6. Cambiar Tráfico a Green

```bash
bash scripts/switch.sh green
```

#### 7. Rollback si es Necesario

```bash
bash scripts/switch.sh blue
```

---

## 🔄 Flujo de Despliegue CI/CD

### Trigger Automático (Push a main)

```bash
git add .
git commit -m "feat: nueva funcionalidad"
git push origin main
```

El pipeline automáticamente:
1. ✅ Ejecuta tests
2. ✅ Construye imágenes Docker
3. ✅ Push a GitHub Container Registry
4. ✅ Despliega al ambiente configurado
5. ✅ Ejecuta health checks

### Trigger Manual (GitHub Actions)

1. Ve a **Actions** en GitHub
2. Selecciona **Blue-Green Deployment Pipeline**
3. Click en **Run workflow**
4. Configura:
   - **Environment**: `blue` o `green`
   - **Version**: `1.0.0`
   - **Auto switch**: `false` o `true`
5. Click **Run workflow**

---

## 🛠️ Comandos Disponibles

### Despliegue

```bash
# Desplegar Blue
bash scripts/deploy-blue.sh 1.0.0

# Desplegar Green
bash scripts/deploy-green.sh 2.0.0

# Despliegue completo automatizado
bash scripts/deploy-complete.sh 1.0.0 blue 2.0.0
```

### Switching

```bash
# Cambiar a Blue
bash scripts/switch.sh blue

# Cambiar a Green
bash scripts/switch.sh green
```

### Health Checks

```bash
# Verificar Blue
bash scripts/health-check.sh app-blue 5000

# Verificar Green
bash scripts/health-check.sh app-green 5000

# Verificar desde fuera
curl http://localhost/api/health
```

### Docker

```bash
# Ver contenedores
docker ps

# Ver logs
docker logs -f app-blue
docker logs -f app-green
docker logs -f nginx-lb

# Estadísticas
docker stats

# Detener todo
docker-compose -f docker-compose-blue-green.yml down

# Reiniciar un contenedor
docker restart app-blue
```

---

## 📊 Monitoreo y Verificación

### Ver Ambiente Activo

```bash
cat nginx/conf.d/active.conf
```

### Ver Estado de Contenedores

```bash
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
```

### Ver Logs en Tiempo Real

```bash
# Todos los logs
docker-compose -f docker-compose-blue-green.yml logs -f

# Solo un servicio
docker logs -f app-blue
```

### Verificar Conectividad

```bash
# Desde Nginx a Blue
docker exec nginx-lb ping app-blue

# Desde Nginx a Green
docker exec nginx-lb ping app-green
```

---

## 🔙 Rollback

### Rollback Inmediato

Si detectas un problema:

```bash
bash scripts/switch.sh blue
```

**Tiempo de rollback**: < 2 segundos ⚡

### Verificar Rollback

```bash
curl http://localhost/api/health
docker logs app-blue --tail 50
```

---

## 🔧 Troubleshooting

### Problema: Health Check Falla

```bash
# Ver logs del contenedor
docker logs app-blue --tail 50

# Verificar estado
docker inspect app-blue

# Reiniciar
docker restart app-blue
```

### Problema: Nginx No Recarga

```bash
# Verificar configuración
docker exec nginx-lb nginx -t

# Recargar
docker exec nginx-lb nginx -s reload

# Reiniciar
docker restart nginx-lb
```

### Problema: Puerto 80 Ocupado

```bash
# Ver qué usa el puerto
sudo lsof -i :80

# Detener proceso
sudo kill -9 <PID>
```

### Problema: Contenedor No Inicia

```bash
# Ver logs
docker logs app-blue

# Verificar variables de entorno
docker inspect app-blue | grep -A 20 Env

# Verificar red
docker network inspect blue-green-network
```

---

## 📖 Documentación Adicional

- [Documentación Completa](BLUE-GREEN-DEPLOYMENT.md)
- [Guía Rápida de Despliegue](blue-green-docs/GUIA-RAPIDA-DESPLIEGUE.md)
- [Resultados y Evidencias](blue-green-docs/RESULTADOS-Y-EVIDENCIAS.md)

---

## 🎓 Conceptos Clave

### ¿Qué es Blue-Green Deployment?

Es una técnica de despliegue que reduce downtime y riesgo manteniendo dos ambientes de producción idénticos:

- **Blue**: Versión actual en producción
- **Green**: Nueva versión en standby

El tráfico se cambia de Blue a Green una vez que Green está validado.

### Ventajas

✅ Zero downtime durante despliegues
✅ Rollback instantáneo
✅ Testing en producción sin riesgo
✅ Reducción de errores en producción
✅ Mayor confianza en despliegues

### Desventajas

⚠️ Requiere el doble de recursos
⚠️ Complejidad en sincronización de datos
⚠️ Requiere estrategias para bases de datos

---

## 🔐 Seguridad

### Variables de Entorno

Nunca subas `.env.production` al repositorio. Usa GitHub Secrets:

```
MONGODB_URI=mongodb://...
JWT_SECRET=tu-secret-key
JWT_EXPIRE=7d
```

### SSH al VPS

Usa claves SSH, no passwords:

```bash
ssh-keygen -t ed25519 -C "tu-email@example.com"
ssh-copy-id deployer@VPS_IP
```

---

## 📈 Métricas y KPIs

| Métrica | Valor Esperado |
|---------|----------------|
| Tiempo de despliegue | ~60 segundos |
| Tiempo de switch | ~2 segundos |
| Tiempo de rollback | ~2 segundos |
| Uptime durante switch | 100% |
| Success rate de health checks | 100% |

---

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Ver `LICENSE` para más información.

---

## 👥 Autor

**Tu Nombre**
- GitHub: [@tu-usuario](https://github.com/tu-usuario)
- Email: tu-email@example.com

---

## 🙏 Agradecimientos

- Curso de DevOps y CI/CD
- Docker Documentation
- Nginx Documentation
- Martin Fowler's Blue-Green Deployment Pattern

---

## 📞 Soporte

Si tienes problemas:

1. Revisa la [Documentación Completa](BLUE-GREEN-DEPLOYMENT.md)
2. Revisa la sección [Troubleshooting](#troubleshooting)
3. Abre un [Issue](https://github.com/tu-usuario/home-reservas-app/issues)

---

## 🗺️ Roadmap

- [x] Implementación básica de Blue-Green
- [x] Scripts de automatización
- [x] Pipeline CI/CD con GitHub Actions
- [x] Health checks automáticos
- [x] Documentación completa
- [ ] HTTPS con Let's Encrypt
- [ ] Monitoreo con Prometheus/Grafana
- [ ] Notificaciones (Slack/Email)
- [ ] Tests de integración automatizados
- [ ] Backups automáticos de BD

---

**¡Felices despliegues! 🚀**

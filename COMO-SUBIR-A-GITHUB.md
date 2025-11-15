# 📤 Cómo Subir el Proyecto Blue-Green a GitHub

## 🎯 Objetivo

Subir todos los archivos de Blue-Green Deployment a tu repositorio de GitHub.

---

## 📋 Pre-requisitos

- [x] Tener una cuenta de GitHub
- [x] Git instalado en tu computadora
- [x] Todos los archivos de Blue-Green creados

---

## 🚀 Opción 1: Usando Git Bash (Recomendado)

### Paso 1: Abrir Git Bash

1. Ve a: `C:\Users\maria\Escritorio\home-reservas-app`
2. Click derecho → "Git Bash Here"

### Paso 2: Verificar Estado

```bash
# Ver archivos modificados y nuevos
git status
```

Deberías ver:

```
Archivos nuevos:
  nginx/nginx-blue-green.conf
  nginx/conf.d/blue.conf
  nginx/conf.d/green.conf
  nginx/conf.d/active.conf
  scripts/deploy-blue.sh
  scripts/deploy-green.sh
  scripts/health-check.sh
  scripts/switch.sh
  scripts/setup-vps.sh
  scripts/deploy-complete.sh
  scripts/verify-setup.sh
  .github/workflows/blue-green-deploy.yml
  docker-compose-blue-green.yml
  ... (y todos los .md)
```

### Paso 3: Agregar Archivos al Staging

```bash
# Agregar todos los archivos nuevos de Blue-Green
git add nginx/
git add scripts/
git add .github/workflows/blue-green-deploy.yml
git add docker-compose-blue-green.yml
git add blue-green-docs/
git add BLUE-GREEN-DEPLOYMENT.md
git add README-BLUE-GREEN.md
git add PASOS-DESPLIEGUE-VPS.md
git add RESUMEN-ARCHIVOS-CREADOS.md
git add COMO-SUBIR-A-GITHUB.md
git add .env.production.example
```

O agregar todo de una vez:

```bash
git add .
```

### Paso 4: Verificar Archivos Agregados

```bash
git status
```

Deberías ver los archivos en verde (staged for commit).

### Paso 5: Crear Commit

```bash
git commit -m "feat: Implementar estrategia Blue-Green Deployment

- Agregar configuración de Nginx para Blue-Green
- Crear scripts de despliegue automatizados (blue, green, switch)
- Implementar health checks automáticos
- Agregar pipeline CI/CD con GitHub Actions
- Crear docker-compose para ambientes Blue y Green
- Agregar documentación completa del proyecto
- Incluir guías de despliegue y troubleshooting

Archivos principales:
- nginx/nginx-blue-green.conf
- scripts/deploy-blue.sh, deploy-green.sh, switch.sh
- .github/workflows/blue-green-deploy.yml
- docker-compose-blue-green.yml
- Documentación completa en markdown"
```

### Paso 6: Push a GitHub

```bash
# Push a la rama main
git push origin main
```

---

## 🚀 Opción 2: Usando GitHub Desktop

### Paso 1: Abrir GitHub Desktop

1. Abre GitHub Desktop
2. Selecciona tu repositorio `home-reservas-app`

### Paso 2: Ver Cambios

En la pestaña "Changes" verás todos los archivos nuevos.

### Paso 3: Crear Commit

1. En el campo de mensaje de commit, escribe:

```
feat: Implementar estrategia Blue-Green Deployment
```

2. En la descripción (opcional):

```
- Agregar configuración de Nginx para Blue-Green
- Crear scripts de despliegue automatizados
- Implementar pipeline CI/CD con GitHub Actions
- Agregar documentación completa
```

3. Click en "Commit to main"

### Paso 4: Push

1. Click en "Push origin" en la parte superior

---

## 🚀 Opción 3: Usando Visual Studio Code

### Paso 1: Abrir VS Code

1. Abre VS Code
2. Abre la carpeta del proyecto

### Paso 2: Ir a Source Control

1. Click en el icono de Source Control (tercer icono en la barra lateral)
2. Verás todos los archivos modificados

### Paso 3: Stage Cambios

1. Hover sobre "Changes"
2. Click en el "+" para agregar todos los archivos

### Paso 4: Commit

1. En el campo de mensaje, escribe:

```
feat: Implementar estrategia Blue-Green Deployment
```

2. Click en el ✓ (checkmark) o presiona `Ctrl+Enter`

### Paso 5: Push

1. Click en los tres puntos "..."
2. Selecciona "Push"

---

## 📝 Verificar en GitHub

### Paso 1: Ir a tu Repositorio

```
https://github.com/TU_USUARIO/home-reservas-app
```

### Paso 2: Verificar Archivos

Deberías ver:

```
✅ nginx/
   ├── nginx-blue-green.conf
   └── conf.d/
       ├── blue.conf
       ├── green.conf
       └── active.conf

✅ scripts/
   ├── deploy-blue.sh
   ├── deploy-green.sh
   ├── health-check.sh
   ├── switch.sh
   ├── setup-vps.sh
   ├── deploy-complete.sh
   └── verify-setup.sh

✅ .github/workflows/
   └── blue-green-deploy.yml

✅ blue-green-docs/
   ├── GUIA-RAPIDA-DESPLIEGUE.md
   └── RESULTADOS-Y-EVIDENCIAS.md

✅ BLUE-GREEN-DEPLOYMENT.md
✅ README-BLUE-GREEN.md
✅ PASOS-DESPLIEGUE-VPS.md
✅ RESUMEN-ARCHIVOS-CREADOS.md
✅ docker-compose-blue-green.yml
✅ .env.production.example
```

---

## 🔐 Configurar GitHub Secrets (para CI/CD)

### Paso 1: Ir a Settings

1. Ve a tu repositorio en GitHub
2. Click en "Settings"
3. En el menú lateral, click en "Secrets and variables" → "Actions"

### Paso 2: Agregar Secrets

Click en "New repository secret" y agrega:

#### Secret 1: VPS_HOST
```
Name: VPS_HOST
Value: [TU_VPS_IP]
```

#### Secret 2: VPS_USER
```
Name: VPS_USER
Value: deployer
```

#### Secret 3: VPS_SSH_KEY
```
Name: VPS_SSH_KEY
Value: [Contenido de tu clave SSH privada]
```

Para obtener la clave SSH:

```bash
# En tu computadora local
cat ~/.ssh/id_rsa

# O si no tienes una, crear nueva:
ssh-keygen -t ed25519 -C "tu-email@example.com"
# Luego copiar la pública al VPS:
ssh-copy-id deployer@TU_VPS_IP
```

#### Secret 4: MONGODB_URI
```
Name: MONGODB_URI
Value: mongodb://username:password@host:27017/database
```

#### Secret 5: JWT_SECRET
```
Name: JWT_SECRET
Value: tu-secret-key-super-segura
```

---

## ✅ Verificar Pipeline

### Paso 1: Ir a Actions

1. En GitHub, ve a la pestaña "Actions"
2. Deberías ver el workflow "Blue-Green Deployment Pipeline"

### Paso 2: Ejecutar Manualmente

1. Click en "Blue-Green Deployment Pipeline"
2. Click en "Run workflow"
3. Selecciona:
   - **Environment**: blue
   - **Version**: 1.0.0
   - **Auto switch**: false
4. Click "Run workflow"

### Paso 3: Monitorear

Verás el pipeline ejecutándose. Debería pasar por:
- ✅ build-and-test
- ✅ build-images
- ✅ deploy
- ✅ notify

---

## 📊 Checklist Final

Antes de marcar como completo, verifica:

- [ ] Todos los archivos subidos a GitHub
- [ ] Commit con mensaje descriptivo
- [ ] Push exitoso
- [ ] Archivos visibles en GitHub
- [ ] GitHub Secrets configurados
- [ ] Pipeline ejecutándose sin errores
- [ ] README actualizado

---

## 🎯 URL para tu Entrega

Después de subir todo a GitHub, tendrás:

### URL del Repositorio
```
https://github.com/TU_USUARIO/home-reservas-app
```

### URL del Pipeline
```
https://github.com/TU_USUARIO/home-reservas-app/actions
```

### URL de Archivos Específicos

Podrás compartir URLs como:

```
# Documentación
https://github.com/TU_USUARIO/home-reservas-app/blob/main/BLUE-GREEN-DEPLOYMENT.md

# Scripts
https://github.com/TU_USUARIO/home-reservas-app/tree/main/scripts

# Pipeline
https://github.com/TU_USUARIO/home-reservas-app/blob/main/.github/workflows/blue-green-deploy.yml
```

---

## 📤 Compartir con el Profesor

Para tu entrega, comparte:

1. **URL del Repositorio**
   ```
   https://github.com/TU_USUARIO/home-reservas-app
   ```

2. **URL del Servicio Desplegado**
   ```
   http://TU_VPS_IP/
   ```

3. **Documentos**
   - Link a `BLUE-GREEN-DEPLOYMENT.md`
   - Link a `RESULTADOS-Y-EVIDENCIAS.md`
   - Screenshots en carpeta `blue-green-docs/screenshots/`

---

## 🔍 Troubleshooting

### Error: "failed to push some refs"

```bash
# Hacer pull primero
git pull origin main

# Resolver conflictos si los hay
# Luego push de nuevo
git push origin main
```

### Error: "Permission denied (publickey)"

```bash
# Configurar SSH con GitHub
ssh-keygen -t ed25519 -C "tu-email@example.com"

# Agregar clave a GitHub:
# 1. Copiar clave pública
cat ~/.ssh/id_ed25519.pub

# 2. GitHub → Settings → SSH and GPG keys → New SSH key
# 3. Pegar la clave pública
```

### Error: Archivos muy grandes

```bash
# Ver qué archivos son grandes
git ls-files -s | sort -k2 -n -r | head -10

# Agregar a .gitignore si son innecesarios
echo "archivo-grande.zip" >> .gitignore
```

---

## 🎁 Extra: Crear Release

Opcionalmente, puedes crear un release en GitHub:

1. Ve a "Releases" en GitHub
2. Click "Create a new release"
3. Tag version: `v1.0.0`
4. Release title: `Blue-Green Deployment v1.0.0`
5. Descripción:
   ```
   Primera versión con Blue-Green Deployment implementado

   Características:
   - Despliegue sin downtime
   - Rollback instantáneo
   - Pipeline CI/CD automatizado
   - Scripts de automatización completos
   ```
6. Click "Publish release"

---

## 🎉 ¡Listo!

Tu proyecto está ahora en GitHub y listo para ser evaluado.

**Próximos pasos:**
1. Desplegar en tu VPS siguiendo `PASOS-DESPLIEGUE-VPS.md`
2. Tomar capturas de pantalla
3. Completar `RESULTADOS-Y-EVIDENCIAS.md`
4. Preparar la presentación

---

**¡Éxito con tu entrega! 🚀**

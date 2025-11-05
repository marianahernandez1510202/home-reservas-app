# Etapa de construcción
FROM node:18-alpine AS builder

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm ci --only=production

# Copiar código fuente
COPY . .

# Etapa de producción
FROM node:18-alpine

WORKDIR /app

# Copiar dependencias desde builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

# Copiar código de la aplicación
COPY . .

# Exponer puerto
EXPOSE 5000

# Usuario no root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

USER nodejs

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Comando de inicio
CMD ["node", "server.js"]
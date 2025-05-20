# Dockerfile backend
FROM node:20

WORKDIR /app

# Instalar dependencias
COPY package*.json ./
RUN npm install

# Copiar código fuente
COPY . .

# Crear directorio de uploads si no existe
RUN mkdir -p /app/uploads

# Exponer puerto
EXPOSE 4000

# Comando para iniciar (será sobrescrito por docker-compose)
CMD ["npm", "run", "dev"]

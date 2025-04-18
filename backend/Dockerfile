# Dockerfile backend

FROM node:18

WORKDIR /app

# Instalar dependencias
COPY package.json ./
COPY package-lock.json* ./

RUN npm install
# RUN npm install sqlite

# Copiar código fuente
COPY . .

RUN mkdir -p /app/uploads
RUN npm run build

# Exponer puerto
EXPOSE 4000

# Comando para iniciar
CMD ["npm", "start"]

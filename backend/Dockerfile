FROM node:18-alpine

WORKDIR /app

# Instalar dependencias
COPY package.json ./
COPY package-lock.json* ./

RUN npm install

# Copiar código fuente
COPY . .

# Exponer puerto
EXPOSE 4000

# Comando para iniciar
CMD ["npm", "start"]

# frontend/Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

# RUN npm install canvas-confetti

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]

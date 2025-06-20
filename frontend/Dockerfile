# frontend/Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .


# Build the frontend
RUN npm run build

# Install a lightweight HTTP server for static files
RUN npm install -g serve

EXPOSE 3000
EXPOSE 10000
# CMD ["npm", "run", "dev"]
CMD ["serve", "-s", "dist", "-l", "10000"]
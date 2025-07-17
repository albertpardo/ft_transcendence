 # frontend/Dockerfile
FROM node:18-alpine

WORKDIR /app

# ARG VITE_API_BASE_URL
# ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

COPY package*.json ./

RUN npm install

# RUN npm install canvas-confetti

COPY . .


# Build the frontend
RUN npm run build

# Install a lightweight HTTP server for static files
RUN npm install -g serve

EXPOSE 3000
EXPOSE 10000

# CMD ["serve", "-s", "dist", "-l", "3000"]
COPY start.sh ./
CMD ["./start.sh"]
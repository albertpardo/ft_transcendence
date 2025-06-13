# Use Node with Alpine for small size
FROM node:23-slim

# Install dependencies we need for ts-node (including typescript)
WORKDIR /app

# Install OS-level deps (needed for node-gyp somtimes)
RUN apt-get update && apt-get install -y \
	python3 make g++ && \
	apt-get clean && rm -rf /var/lib/apt/lists/*

# Copy package.json and install deps
COPY package*.json ./
RUN npm install

# Install ts-node & typescript globally (or via devDeps)
RUN npm install -g ts-node typescript ts-node-dev

# Install curl for health checks
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
  CMD curl -f http://localhost:10000/health || exit 1

# Copy source code & certs
COPY . .

# Expose HTTPS port
EXPOSE 8443
EXPOSE 10000
# EXPOSE 8080

# Run using ts-node (just like the local command)

#CMD ["npm", "run", "dev"]
#CMD ["node", "dist/index.js"]

CMD ["npm", "run", "serve"]
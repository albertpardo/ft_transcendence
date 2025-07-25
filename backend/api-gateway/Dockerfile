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

# Copy source code & certs
COPY . .

#by apardo-m
RUN chmod +x script.sh

# Expose HTTPS port
EXPOSE 8443

# Run using ts-node (just like the local command)
#CMD ["npm", "run", "dev"]

#by apardo-m
CMD ["sh" , "./script.sh"] 

# use the official node image (small size)
FROM node:23-slim

# create and set the working directory
WORKDIR /app

# install build dependencies (for compiling sqlite3 and bcrypt)
RUN apt-get update && apt-get install -y \
  python3 make g++ sqlite3 \
  && apt-get clean && rm -rf /var/lib/apt/lists/*

# copy package.json and package-lock.json
COPY package*.json ./

# install dependencies
RUN npm install

# copy all the project files
COPY . .

# expose the container port (must be consistent with the service listening port)
EXPOSE 9001

# start service
CMD ["node", "server.js"]

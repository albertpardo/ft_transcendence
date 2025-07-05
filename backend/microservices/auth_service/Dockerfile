FROM node:20-alpine

# install tools needed when setting up sqlite3
RUN apk add --no-cache python3 make g++ sqlite

# set working directory
WORKDIR /app

# copy package.json and package-lock.json (if there are)
COPY package*.json ./

# (make sure sqlite3, speakeasy, dotenv are all in package.json)
RUN npm install

# copy all code of the project
COPY . .

# expose port
EXPOSE 9003

# set up app
CMD ["node", "server.js"]

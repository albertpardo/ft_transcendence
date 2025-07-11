FROM node:20

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN mkdir -p./data

#COPY ./data/mydb.sqlite ./data/

RUN npm run build

EXPOSE 9002

# CMD ["npm", "run", "dev"]
CMD ["npm", "start"]

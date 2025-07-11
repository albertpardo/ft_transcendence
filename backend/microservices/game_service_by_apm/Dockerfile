FROM node:20

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN chmod +x script.sh

EXPOSE 9002

#CMD ["npm", "run", "dev"]
CMD ["sh" , "./script.sh"]

FROM node:20

WORKDIR /app

COPY package.json /app

RUN npm install

COPY . .

COPY firebase-key.json /app/firebase-key.json

RUN npm run build

EXPOSE 8080

CMD ["npm", "run", "start:prod"]
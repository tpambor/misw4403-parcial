FROM node:20

WORKDIR /app

COPY . .

RUN npm install --quiet

CMD ["npm", "run", "start"]

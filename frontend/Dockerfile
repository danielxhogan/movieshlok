FROM node:18-alpine
WORKDIR /movieshlok

ENV NODE_ENV=production

COPY package*.json ./
RUN npm i

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "run", "start"]
FROM node:18-alpine
WORKDIR /movieshlok

ENV NODE_ENV=production

COPY package*.json ./
RUN npm i

COPY . .
RUN npm run build

RUN --mount=type=secret,id=TMDB_API_KEY,required=true

EXPOSE 3000
CMD ["npm", "run", "start"]
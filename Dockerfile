FROM node:14 AS app-base
WORKDIR /app
COPY ./api/package.json ./api/
COPY ./api/package-lock.json ./api/
COPY ./api/tsconfig.json ./api/
COPY ./api/tsconfig.build.json ./api/
COPY ./api/nest-cli.json ./api/
COPY ./api/jest*.ts ./api/
COPY ./api/jest*.js ./api/
COPY ./api/assets ./api/assets/
WORKDIR /app/api
RUN npm install

COPY ./api/src ./src/
RUN npm run build

COPY api/.env.toast .

ENV NODE_ENV=toast

EXPOSE 3000
CMD [ "node", "./dist/main.js" ]

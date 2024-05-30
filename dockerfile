# build stage
FROM node:20-alpine AS build
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# prod stage
FROM node:20-alpine
WORKDIR /usr/src/app
ARG NODE_ENV \
  DB_HOST \
  DB_PORT \
  DB_USER \
  DB_PASS \
  DB_NAME \
  PROTOCOL \
  HOST \
  PORT \
  JWT_SECRET \
  SALT_ROUNDS \
  CA_CERT
ENV PORT=${PORT} \
  NODE_ENV=${NODE_ENV}
COPY --from=build /usr/src/app/dist ./dist
COPY package*.json ./
RUN npm install --only=production
RUN rm package*.json
EXPOSE ${PORT}
CMD ["node", "dist/main.js"]

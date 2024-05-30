# build stage
FROM node:21-alpine AS build
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# prod stage
FROM node:21-alpine
WORKDIR /usr/src/app
ARG PORT
ENV NODE_ENV \
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
COPY --from=build /usr/src/app/dist ./dist
EXPOSE ${PORT}
CMD ["node", "dist/main.js"]

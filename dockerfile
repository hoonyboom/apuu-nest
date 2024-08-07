# build stage
FROM node:22-alpine AS build
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install --omit=dev
COPY . .
RUN npm run build

# prod stage
FROM node:22-alpine
WORKDIR /usr/src/app
ARG PORT
ENV DB_HOST \
  DB_PORT \
  DB_USER \
  DB_PASS \
  DB_NAME \
  PROTOCOL \
  HOST \
  PORT \
  JWT_SECRET \
  SALT_ROUNDS
COPY --from=build /usr/src/app/dist ./dist
COPY --from=build /usr/src/app/public ./public
COPY --from=build /usr/src/app/node_modules ./node_modules
COPY package*.json ./
EXPOSE ${PORT}
ENTRYPOINT ["npm", "run", "start:prod"]

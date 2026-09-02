FROM node:22-alpine AS build
WORKDIR /app
RUN apk add --no-cache bash coreutils curl
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app /app
USER node
EXPOSE 3000
CMD ["npm", "run", "start"]

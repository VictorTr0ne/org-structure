# Build context is the repo root (npm workspaces share one root package-lock.json).
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
COPY client/package.json client/package.json
COPY server/package.json server/package.json
RUN npm ci
COPY server ./server
RUN npm run build --workspace server

FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY server/package.json ./package.json
RUN npm install --omit=dev
COPY --from=build /app/server/dist ./dist
EXPOSE 3001
CMD ["node", "dist/index.js"]

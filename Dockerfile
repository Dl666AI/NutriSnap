# Build stage - compile frontend
FROM node:20-alpine AS frontend-builder

WORKDIR /app

# Copy frontend package files
COPY package.json ./
RUN npm install

# Copy frontend source and build
COPY index.html index.tsx App.tsx tsconfig.json vite.config.ts ./
COPY components/ ./components/
COPY contexts/ ./contexts/
COPY services/ ./services/
COPY types.ts ./

RUN npm run build

# Production stage - run server
FROM node:20-alpine

WORKDIR /app

# Copy server files
COPY server/package.json ./server/
WORKDIR /app/server
RUN npm install --production

# Copy server source
COPY server/*.js ./

# Copy built frontend from builder stage
COPY --from=frontend-builder /app/dist /app/dist

# Cloud Run sets PORT env var
ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

CMD ["node", "index.js"]

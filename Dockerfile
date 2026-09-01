FROM node:22-alpine AS builder

WORKDIR /app

# Copy root and workspace package files
COPY package*.json ./
COPY apps/api/package*.json ./apps/api/
COPY apps/web/package*.json ./apps/web/

RUN npm install

# Copy application source
COPY . .

# Build frontend
RUN npm --workspace=apps/web run build

EXPOSE 4000

CMD ["npm", "--workspace=apps/api", "run", "start"]

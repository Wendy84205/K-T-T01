
FROM node:18-alpine

WORKDIR /app

# Install netcat for waiting mysql
RUN apk add --no-cache netcat-openbsd curl
FROM node:18

WORKDIR /app

RUN apt-get update && apt-get install -y \
    netcat-openbsd \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
COPY nest-cli.json ./
COPY tsconfig*.json ./

RUN npm ci

COPY . .

RUN mkdir -p /app/uploads && chmod 777 /app/uploads

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:3001/api/v1/auth/health || exit 1

COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["npm", "run", "start:dev"]


FROM node:18-alpine

WORKDIR /app

# Install netcat for waiting mysql
RUN apk add --no-cache netcat-openbsd curl
FROM node:18

WORKDIR /app

# Install netcat and curl for waiting mysql (Debian/Ubuntu)
RUN apt-get update && apt-get install -y \
    netcat \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package*.json ./
COPY nest-cli.json ./
COPY tsconfig*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Create uploads directory
RUN mkdir -p /app/uploads && chmod 777 /app/uploads

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3001/api/v1/health || exit 1

# Start application in development mode
<<<<<<< Updated upstream
CMD ["npm", "run", "start:dev"]
=======
CMD ["npm", "run", "start:dev"]
>>>>>>> Stashed changes

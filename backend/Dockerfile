FROM node:18-alpine

WORKDIR /app

# Install netcat for waiting mysql
RUN apk add --no-cache netcat-openbsd curl

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
CMD ["npm", "run", "start:dev"]

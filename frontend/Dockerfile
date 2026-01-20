FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies with clear cache
RUN npm cache clean --force && \
    npm ci --legacy-peer-deps --unsafe-perm

# Copy source code
COPY . .

# Check if react-scripts exists
RUN ls -la node_modules/.bin/react-scripts || echo "react-scripts not found" && \
    chmod +x node_modules/.bin/*

# Create proper permissions
RUN chown -R node:node /app && \
    chmod -R 755 /app

# Switch to non-root user
USER node

# Expose port
EXPOSE 3000

# Start development server
CMD ["npm", "start"]

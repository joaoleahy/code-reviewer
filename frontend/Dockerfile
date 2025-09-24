# Multi-stage build for React app

# Stage 1: Build stage
FROM node:18-alpine as builder

# Set work directory
WORKDIR /app

# Copy package files for better cache layering
COPY package*.json ./

# Install ALL dependencies for build (including devDependencies)
RUN npm ci --silent && npm cache clean --force

# Copy source code
COPY . .

# Build the app with optimizations
RUN npm run build

# Stage 2: Production stage with nginx
FROM nginx:alpine as production

# Install curl for health check
RUN apk --no-cache add curl

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built app from builder stage
COPY --from=builder /app/build /usr/share/nginx/html

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000 || exit 1

# Expose port
EXPOSE 3000

# Start nginx
CMD ["nginx", "-g", "daemon off;"]

# Development stage
FROM node:18-alpine as development

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

WORKDIR /app

# Copy package files for better cache layering
COPY package*.json ./

# Install dependencies with better caching
RUN npm ci --silent && npm cache clean --force

# Copy source code
COPY . .

# Expose port
EXPOSE 3000

# Use dumb-init for proper signal handling
ENTRYPOINT ["dumb-init", "--"]

# Start development server with polling for Docker
CMD ["npm", "start"]

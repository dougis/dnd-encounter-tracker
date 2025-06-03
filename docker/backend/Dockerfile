# Build stage
FROM node:20-alpine AS build

WORKDIR /app

# Copy package.json files and install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy the rest of the backend code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy package.json files
COPY package.json package-lock.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy the build output from the build stage
COPY --from=build /app/dist ./dist

# Set environment variables
ENV NODE_ENV=production

# Expose the API port
EXPOSE 3001

# Start the server
CMD ["node", "dist/server.js"]

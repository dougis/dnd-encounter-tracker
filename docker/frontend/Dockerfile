# Build stage
FROM node:20-alpine AS build

WORKDIR /app

# Copy package.json files and install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy the rest of the frontend code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM nginx:stable-alpine

# Copy the build output from the build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom nginx configuration if needed
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose the port
EXPOSE 3000

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]

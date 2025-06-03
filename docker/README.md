# Docker Setup for D&D Encounter Tracker

This directory contains Docker configuration files for running the D&D Encounter Tracker application in both development and production environments.

## Project Structure

```
docker/
├── frontend/                 # Frontend Docker files
│   ├── Dockerfile           # Production frontend Dockerfile
│   └── Dockerfile.dev       # Development frontend Dockerfile
├── backend/                  # Backend Docker files
│   ├── Dockerfile           # Production backend Dockerfile
│   └── Dockerfile.dev       # Development backend Dockerfile
├── mongo/                    # MongoDB configuration
│   └── init.js              # MongoDB initialization script
├── docker-compose.yml        # Development docker-compose configuration
└── docker-compose.prod.yml   # Production docker-compose configuration
```

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

## Development Environment Setup

1. Make sure Docker is installed and running on your system.

2. Create `.env` file in the root of the project (one level up from this directory) with the following variables:
   ```
   NODE_ENV=development
   JWT_SECRET=your_jwt_secret_here
   JWT_REFRESH_SECRET=your_refresh_secret_here
   ENCRYPTION_SECRET=your_encryption_key
   STRIPE_SECRET_KEY=sk_test_your_stripe_test_key
   STRIPE_WEBHOOK_SECRET=whsec_your_stripe_webhook_secret
   ```

3. Start the development environment:
   ```bash
   cd /path/to/dnd-encounter-tracker
   docker-compose -f docker/docker-compose.yml up
   ```

4. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001/api/v1
   - MongoDB: mongodb://localhost:27017 (accessible from your host machine)

5. Default development admin credentials:
   - Email: admin@localhost
   - Password: password123

## Production Environment Setup

1. Create a `.env.production` file in the root of the project with production-ready values:
   ```
   NODE_ENV=production
   MONGODB_URI=your_mongodb_atlas_connection_string
   REDIS_URL=your_redis_connection_string
   JWT_SECRET=your_secure_jwt_secret
   JWT_REFRESH_SECRET=your_secure_refresh_secret
   ENCRYPTION_SECRET=your_secure_encryption_key
   STRIPE_SECRET_KEY=sk_live_your_stripe_live_key
   STRIPE_WEBHOOK_SECRET=whsec_your_stripe_webhook_secret
   ```

2. Build and start the production environment:
   ```bash
   cd /path/to/dnd-encounter-tracker
   docker-compose -f docker/docker-compose.prod.yml --env-file .env.production up -d
   ```

## Database Management

### Accessing MongoDB Shell

```bash
docker exec -it dnd-encounter-tracker_mongo_1 mongosh
```

### Database Backup

```bash
docker exec -it dnd-encounter-tracker_mongo_1 mongodump --db dnd_encounter_tracker --out /backup
```

### Database Restore

```bash
docker exec -it dnd-encounter-tracker_mongo_1 mongorestore --db dnd_encounter_tracker /backup/dnd_encounter_tracker
```

## Troubleshooting

### Clearing Docker Volumes

If you need to completely reset the database:

```bash
docker-compose -f docker/docker-compose.yml down -v
```

### Rebuilding Containers

If you've updated dependencies:

```bash
docker-compose -f docker/docker-compose.yml build --no-cache
docker-compose -f docker/docker-compose.yml up
```

### Viewing Logs

```bash
# All services
docker-compose -f docker/docker-compose.yml logs

# Specific service
docker-compose -f docker/docker-compose.yml logs backend
```

## Production Deployment Recommendations

For production deployment, consider using:
- MongoDB Atlas for the database
- A managed Redis service
- Container orchestration like Kubernetes or Docker Swarm
- CI/CD pipeline for automated testing and deployment
- Load balancer for distributing traffic
- HTTPS with proper certificates

## Security Notes

- Never commit .env files with sensitive credentials to version control
- Use separate credentials for development and production
- In production, use properly secured and rotated secrets
- Set appropriate network security rules for database access

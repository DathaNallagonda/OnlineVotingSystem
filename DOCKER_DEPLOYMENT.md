# Docker Deployment Guide

## Prerequisites

- Docker installed on your system ([Get Docker](https://docs.docker.com/get-docker/))
- Docker Compose installed ([Get Docker Compose](https://docs.docker.com/compose/install/))
- Your Supabase credentials

## Quick Start

### 1. Set Environment Variables

Create a `.env.production` file in the project root:

```bash
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
VITE_SUPABASE_PROJECT_ID=your_supabase_project_id
```

### 2. Build and Run with Docker Compose

```bash
# Build and start the container
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the container
docker-compose down
```

The application will be available at: `http://localhost:8080`

### 3. Build and Run with Docker (without compose)

```bash
# Build the image
docker build \
  --build-arg VITE_SUPABASE_URL=your_url \
  --build-arg VITE_SUPABASE_PUBLISHABLE_KEY=your_key \
  --build-arg VITE_SUPABASE_PROJECT_ID=your_id \
  -t election-voting-system .

# Run the container
docker run -d -p 8080:80 --name voting-app election-voting-system

# View logs
docker logs -f voting-app

# Stop the container
docker stop voting-app
docker rm voting-app
```

## Docker Commands Reference

### Build

```bash
# Build the image
docker build -t election-voting-system .

# Build with build arguments
docker build \
  --build-arg VITE_SUPABASE_URL=your_url \
  --build-arg VITE_SUPABASE_PUBLISHABLE_KEY=your_key \
  --build-arg VITE_SUPABASE_PROJECT_ID=your_id \
  -t election-voting-system .
```

### Run

```bash
# Run on port 8080
docker run -d -p 8080:80 --name voting-app election-voting-system

# Run on different port (e.g., 3000)
docker run -d -p 3000:80 --name voting-app election-voting-system
```

### Management

```bash
# List running containers
docker ps

# View logs
docker logs voting-app
docker logs -f voting-app  # Follow logs

# Stop container
docker stop voting-app

# Start stopped container
docker start voting-app

# Restart container
docker restart voting-app

# Remove container
docker rm voting-app

# Remove container forcefully
docker rm -f voting-app
```

### Images

```bash
# List images
docker images

# Remove image
docker rmi election-voting-system

# Build without cache
docker build --no-cache -t election-voting-system .
```

## Docker Compose Commands

```bash
# Build and start
docker-compose up -d

# Build without cache
docker-compose build --no-cache

# Start services
docker-compose start

# Stop services
docker-compose stop

# Restart services
docker-compose restart

# View logs
docker-compose logs
docker-compose logs -f  # Follow logs

# Stop and remove
docker-compose down

# Stop, remove, and delete volumes
docker-compose down -v
```

## Production Deployment

### Deploy to Docker Host

1. Copy files to server:
```bash
scp -r . user@server:/path/to/app
```

2. SSH into server:
```bash
ssh user@server
cd /path/to/app
```

3. Create `.env.production`:
```bash
cat > .env.production << EOF
VITE_SUPABASE_URL=your_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_key
VITE_SUPABASE_PROJECT_ID=your_id
EOF
```

4. Deploy:
```bash
docker-compose up -d
```

### Deploy to Cloud Platforms

#### AWS ECS
```bash
# Push to ECR
aws ecr get-login-password | docker login --username AWS --password-stdin your-registry
docker tag election-voting-system:latest your-registry/election-voting-system:latest
docker push your-registry/election-voting-system:latest
```

#### Google Cloud Run
```bash
# Push to GCR
gcloud auth configure-docker
docker tag election-voting-system gcr.io/project-id/election-voting-system
docker push gcr.io/project-id/election-voting-system
gcloud run deploy election-voting-system --image gcr.io/project-id/election-voting-system
```

#### Azure Container Instances
```bash
# Push to ACR
az acr login --name yourregistry
docker tag election-voting-system yourregistry.azurecr.io/election-voting-system
docker push yourregistry.azurecr.io/election-voting-system
```

## Troubleshooting

### Container won't start
```bash
# Check logs
docker logs voting-app

# Check if port is in use
netstat -an | grep 8080  # Linux/Mac
netstat -an | findstr 8080  # Windows
```

### Build fails
```bash
# Clear Docker cache
docker system prune -a

# Rebuild without cache
docker build --no-cache -t election-voting-system .
```

### Can't connect to Supabase
- Verify environment variables are set correctly
- Check Supabase URL is accessible from container
- Verify Supabase project is active

### Permission denied
```bash
# Run with sudo (Linux)
sudo docker-compose up -d

# Add user to docker group
sudo usermod -aG docker $USER
```

## File Structure

```
.
├── Dockerfile              # Docker image definition
├── docker-compose.yml      # Docker Compose configuration
├── nginx.conf             # Nginx web server config
├── .dockerignore          # Files to exclude from image
├── .env.production        # Production environment variables
└── DOCKER_DEPLOYMENT.md   # This file
```

## Configuration

### Change Port

Edit `docker-compose.yml`:
```yaml
ports:
  - "3000:80"  # Change 3000 to your desired port
```

### Custom Domain

Update `nginx.conf`:
```nginx
server_name your-domain.com;
```

### SSL/HTTPS

Add SSL certificates and update `nginx.conf`:
```nginx
listen 443 ssl;
ssl_certificate /path/to/cert.pem;
ssl_certificate_key /path/to/key.pem;
```

## Health Check

```bash
# Check if container is running
docker ps | grep voting-app

# Test the application
curl http://localhost:8080

# Check container health
docker inspect voting-app | grep Health -A 10
```

## Backup & Restore

```bash
# Export container
docker export voting-app > voting-app-backup.tar

# Import container
docker import voting-app-backup.tar election-voting-system:backup

# Save image
docker save election-voting-system > election-voting-system.tar

# Load image
docker load < election-voting-system.tar
```

## Support

For issues or questions:
- Check container logs: `docker logs voting-app`
- Verify environment variables
- Ensure Supabase is accessible
- Check Docker version: `docker --version`

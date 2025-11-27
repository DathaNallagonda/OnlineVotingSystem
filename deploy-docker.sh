#!/bin/bash

# Docker Deployment Script for Election Voting System

set -e

echo "================================"
echo "Election Voting System - Docker Deployment"
echo "================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Error: Docker is not installed${NC}"
    echo "Please install Docker from: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}Error: Docker Compose is not installed${NC}"
    echo "Please install Docker Compose from: https://docs.docker.com/compose/install/"
    exit 1
fi

echo -e "${GREEN}✓ Docker is installed${NC}"
echo -e "${GREEN}✓ Docker Compose is installed${NC}"
echo ""

# Check if .env.production exists
if [ ! -f .env.production ]; then
    echo -e "${YELLOW}Warning: .env.production file not found${NC}"
    echo "Creating .env.production from template..."
    
    read -p "Enter your Supabase URL: " SUPABASE_URL
    read -p "Enter your Supabase Publishable Key: " SUPABASE_KEY
    read -p "Enter your Supabase Project ID: " SUPABASE_PROJECT_ID
    
    cat > .env.production << EOF
VITE_SUPABASE_URL=$SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY=$SUPABASE_KEY
VITE_SUPABASE_PROJECT_ID=$SUPABASE_PROJECT_ID
EOF
    
    echo -e "${GREEN}✓ Created .env.production${NC}"
fi

# Load environment variables
export $(cat .env.production | xargs)

echo ""
echo "Building Docker image..."
echo "========================"

# Build the image
docker-compose build --no-cache

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Docker image built successfully${NC}"
else
    echo -e "${RED}✗ Failed to build Docker image${NC}"
    exit 1
fi

echo ""
echo "Starting container..."
echo "===================="

# Start the container
docker-compose up -d

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Container started successfully${NC}"
else
    echo -e "${RED}✗ Failed to start container${NC}"
    exit 1
fi

echo ""
echo "================================"
echo -e "${GREEN}Deployment completed successfully!${NC}"
echo "================================"
echo ""
echo "Application is running at: http://localhost:8080"
echo ""
echo "Useful commands:"
echo "  View logs:      docker-compose logs -f"
echo "  Stop:           docker-compose stop"
echo "  Restart:        docker-compose restart"
echo "  Remove:         docker-compose down"
echo ""

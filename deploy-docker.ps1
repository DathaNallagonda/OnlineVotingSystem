# Docker Deployment Script for Election Voting System
# PowerShell version for Windows

$ErrorActionPreference = "Stop"

Write-Host "================================" -ForegroundColor Cyan
Write-Host "Election Voting System - Docker Deployment" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Check if Docker is installed
try {
    docker --version | Out-Null
    Write-Host "✓ Docker is installed" -ForegroundColor Green
} catch {
    Write-Host "Error: Docker is not installed" -ForegroundColor Red
    Write-Host "Please install Docker Desktop from: https://docs.docker.com/desktop/install/windows-install/"
    exit 1
}

# Check if Docker Compose is installed
try {
    docker-compose --version | Out-Null
    Write-Host "✓ Docker Compose is installed" -ForegroundColor Green
} catch {
    Write-Host "Error: Docker Compose is not installed" -ForegroundColor Red
    Write-Host "Please install Docker Desktop (includes Docker Compose)"
    exit 1
}

Write-Host ""

# Check if .env.production exists
if (-not (Test-Path .env.production)) {
    Write-Host "Warning: .env.production file not found" -ForegroundColor Yellow
    Write-Host "Creating .env.production from template..."
    
    $SUPABASE_URL = Read-Host "Enter your Supabase URL"
    $SUPABASE_KEY = Read-Host "Enter your Supabase Publishable Key"
    $SUPABASE_PROJECT_ID = Read-Host "Enter your Supabase Project ID"
    
    @"
VITE_SUPABASE_URL=$SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY=$SUPABASE_KEY
VITE_SUPABASE_PROJECT_ID=$SUPABASE_PROJECT_ID
"@ | Out-File -FilePath .env.production -Encoding UTF8
    
    Write-Host "✓ Created .env.production" -ForegroundColor Green
}

# Load environment variables
Get-Content .env.production | ForEach-Object {
    if ($_ -match "^([^=]+)=(.*)$") {
        [System.Environment]::SetEnvironmentVariable($matches[1], $matches[2], "Process")
    }
}

Write-Host ""
Write-Host "Building Docker image..." -ForegroundColor Cyan
Write-Host "========================"

# Build the image
docker-compose build --no-cache

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Docker image built successfully" -ForegroundColor Green
} else {
    Write-Host "✗ Failed to build Docker image" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Starting container..." -ForegroundColor Cyan
Write-Host "===================="

# Start the container
docker-compose up -d

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Container started successfully" -ForegroundColor Green
} else {
    Write-Host "✗ Failed to start container" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "Deployment completed successfully!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Application is running at: http://localhost:8080" -ForegroundColor Yellow
Write-Host ""
Write-Host "Useful commands:"
Write-Host "  View logs:      docker-compose logs -f"
Write-Host "  Stop:           docker-compose stop"
Write-Host "  Restart:        docker-compose restart"
Write-Host "  Remove:         docker-compose down"
Write-Host ""

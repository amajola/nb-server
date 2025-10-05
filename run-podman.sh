#!/bin/bash

# Podman Pod Management Script for nb-server
# This script provides a native Podman approach using pods

set -e

POD_NAME="nb-server-pod"
DB_CONTAINER="nb-server-db"
APP_CONTAINER="nb-server-app"
NETWORK_NAME="nb-server-net"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if pod exists
pod_exists() {
    podman pod exists "$POD_NAME" 2>/dev/null
}

# Function to check if container is running
container_running() {
    podman container exists "$1" && [ "$(podman inspect --format='{{.State.Status}}' "$1" 2>/dev/null)" = "running" ]
}

# Start function
start() {
    print_status "Starting nb-server application stack..."
    
    # Create pod if it doesn't exist
    if ! pod_exists; then
        print_status "Creating pod '$POD_NAME'..."
        podman pod create \
            --name "$POD_NAME" \
            --publish 3000:3000 \
            --publish 5432:5432
    else
        print_status "Pod '$POD_NAME' already exists"
    fi

    # Build database image if needed
    if ! podman image exists nb-server-db:latest; then
        print_status "Building database image..."
        podman build -f Docker/database/Dockerfile -t nb-server-db .
    fi

    # Build app image if needed
    if ! podman image exists nb-server-app:latest; then
        print_status "Building application image..."
        podman build -f Docker/application/Dockerfile -t nb-server-app .
    fi

    # Start database container
    if ! container_running "$DB_CONTAINER"; then
        print_status "Starting database container..."
        podman run -d \
            --name "$DB_CONTAINER" \
            --pod "$POD_NAME" \
            -e POSTGRES_USER=myuser \
            -e POSTGRES_PASSWORD=mypassword \
            -e POSTGRES_DB=mydb \
            -v nb-server-db-data:/var/lib/postgresql/data \
            nb-server-db:latest
        
        # Wait for database to be ready
        print_status "Waiting for database to be ready..."
        for i in {1..30}; do
            if podman exec "$DB_CONTAINER" pg_isready -U myuser -d mydb >/dev/null 2>&1; then
                print_status "Database is ready!"
                break
            fi
            if [ $i -eq 30 ]; then
                print_error "Database failed to start within 30 seconds"
                exit 1
            fi
            sleep 1
        done
    else
        print_status "Database container already running"
    fi

    # Start application container
    if ! container_running "$APP_CONTAINER"; then
        print_status "Starting application container..."
        podman run -d \
            --name "$APP_CONTAINER" \
            --pod "$POD_NAME" \
            -e DATABASE_URL=postgres://myuser:mypassword@localhost:5432/mydb \
            -e DB_HOST=localhost \
            -e DB_USER=myuser \
            -e DB_PASSWORD=mypassword \
            -e DB_NAME=mydb \
            -e DB_PORT=5432 \
            -e NODE_ENV=production \
            -e BETTER_AUTH_SECRET=your-32-character-secret-key-here-replace-this-in-production \
            -e BETTER_AUTH_URL=http://localhost:3000 \
            nb-server-app:latest
    else
        print_status "Application container already running"
    fi

    print_status "Application stack started successfully!"
    print_status "Database available at: localhost:5432"
    print_status "Application available at: http://localhost:3000"
}

# Stop function
stop() {
    print_status "Stopping nb-server application stack..."
    
    if container_running "$APP_CONTAINER"; then
        print_status "Stopping application container..."
        podman container stop "$APP_CONTAINER"
        podman container rm "$APP_CONTAINER"
    fi
    
    if container_running "$DB_CONTAINER"; then
        print_status "Stopping database container..."
        podman container stop "$DB_CONTAINER"
        podman container rm "$DB_CONTAINER"
    fi
    
    if pod_exists; then
        print_status "Removing pod..."
        podman pod rm "$POD_NAME"
    fi
    
    print_status "Application stack stopped"
}

# Restart function
restart() {
    print_status "Restarting nb-server application stack..."
    stop
    sleep 2
    start
}

# Logs function
logs() {
    if [ "$2" = "app" ]; then
        podman logs -f "$APP_CONTAINER"
    elif [ "$2" = "db" ]; then
        podman logs -f "$DB_CONTAINER"
    else
        print_status "Showing logs for both containers..."
        podman pod logs -f "$POD_NAME"
    fi
}

# Status function
status() {
    print_status "Checking status of nb-server stack..."
    
    if pod_exists; then
        echo "Pod Status:"
        podman pod ps --filter name="$POD_NAME"
        echo ""
        echo "Container Status:"
        podman ps --filter pod="$POD_NAME"
    else
        print_warning "Pod '$POD_NAME' does not exist"
    fi
}

# Clean function - removes everything including images and volumes
clean() {
    print_warning "This will remove all containers, images, and data volumes!"
    read -p "Are you sure? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        stop
        print_status "Removing images..."
        podman rmi nb-server-db:latest nb-server-app:latest 2>/dev/null || true
        print_status "Removing volumes..."
        podman volume rm nb-server-db-data 2>/dev/null || true
        print_status "Clean completed"
    else
        print_status "Clean cancelled"
    fi
}

# Build function
build() {
    print_status "Building images..."
    print_status "Building database image..."
    podman build -f Docker/database/Dockerfile -t nb-server-db .
    print_status "Building application image..."
    podman build -f Docker/application/Dockerfile -t nb-server-app .
    print_status "Build completed"
}

# Help function
help() {
    echo "Usage: $0 {start|stop|restart|logs|status|clean|build|help}"
    echo ""
    echo "Commands:"
    echo "  start    - Start the application stack (database + app)"
    echo "  stop     - Stop and remove containers and pod"
    echo "  restart  - Stop and start the application stack"
    echo "  logs     - Show logs (use 'logs app' or 'logs db' for specific container)"
    echo "  status   - Show status of containers and pod"
    echo "  clean    - Remove everything (containers, images, volumes)"
    echo "  build    - Build/rebuild images"
    echo "  help     - Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 start          # Start the entire stack"
    echo "  $0 logs app       # Show application logs"
    echo "  $0 logs db        # Show database logs"
    echo "  $0 status         # Check what's running"
}

# Main command handling
case "$1" in
    start)
        start
        ;;
    stop)
        stop
        ;;
    restart)
        restart
        ;;
    logs)
        logs "$@"
        ;;
    status)
        status
        ;;
    clean)
        clean
        ;;
    build)
        build
        ;;
    help|--help|-h)
        help
        ;;
    *)
        print_error "Unknown command: $1"
        help
        exit 1
        ;;
esac
#!/bin/bash

# Docker Compose Management Script for nb-server
# This script provides easy commands to manage the application using Docker Compose

set -e

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
COMPOSE_FILE="$PROJECT_DIR/Docker/docker-compose.yml"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

print_header() {
    echo -e "${BLUE}=== $1 ===${NC}"
}

# Check if docker compose is available
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed or not in PATH"
        exit 1
    fi
    
    if ! docker compose version &> /dev/null; then
        print_error "Docker Compose is not available"
        exit 1
    fi
}

# Start services
start() {
    print_header "Starting nb-server services"
    check_docker
    cd "$PROJECT_DIR"
    docker compose -f "$COMPOSE_FILE" up -d
    print_status "Services started successfully!"
    print_status "Database available at: localhost:5432"
    print_status "Application available at: http://localhost:8000"
}

# Stop services
stop() {
    print_header "Stopping nb-server services"
    check_docker
    cd "$PROJECT_DIR"
    docker compose -f "$COMPOSE_FILE" down
    print_status "Services stopped successfully"
}

# Restart services
restart() {
    print_header "Restarting nb-server services"
    stop
    sleep 2
    start
}

# Build images
build() {
    print_header "Building nb-server images"
    check_docker
    cd "$PROJECT_DIR"
    docker compose -f "$COMPOSE_FILE" build "$@"
    print_status "Build completed successfully"
}

# Rebuild and restart
rebuild() {
    print_header "Rebuilding and restarting nb-server services"
    stop
    build --no-cache
    start
}

# Show logs
logs() {
    check_docker
    cd "$PROJECT_DIR"
    if [ -n "$2" ]; then
        docker compose -f "$COMPOSE_FILE" logs -f "$2"
    else
        docker compose -f "$COMPOSE_FILE" logs -f
    fi
}

# Show status
status() {
    print_header "nb-server services status"
    check_docker
    cd "$PROJECT_DIR"
    docker compose -f "$COMPOSE_FILE" ps
}

# Execute command in app container
exec_app() {
    check_docker
    cd "$PROJECT_DIR"
    docker compose -f "$COMPOSE_FILE" exec app "$@"
}

# Execute command in db container
exec_db() {
    check_docker
    cd "$PROJECT_DIR"
    docker compose -f "$COMPOSE_FILE" exec db "$@"
}

# Connect to database
db_shell() {
    print_status "Connecting to PostgreSQL database..."
    exec_db psql -U myuser -d mydb
}

# Clean everything
clean() {
    print_warning "This will remove all containers, networks, and volumes!"
    read -p "Are you sure? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_header "Cleaning nb-server"
        check_docker
        cd "$PROJECT_DIR"
        docker compose -f "$COMPOSE_FILE" down -v --rmi all
        print_status "Clean completed"
    else
        print_status "Clean cancelled"
    fi
}

# Show help
help() {
    cat << EOF
Docker Compose Management Script for nb-server

Usage: $0 [COMMAND] [OPTIONS]

Commands:
  start           Start all services in detached mode
  stop            Stop all services
  restart         Restart all services
  build           Build/rebuild images
  rebuild         Rebuild images from scratch and restart services
  logs [SERVICE]  Show logs (optionally for specific service: app or db)
  status          Show status of all services
  exec-app CMD    Execute command in app container
  exec-db CMD     Execute command in db container
  db-shell        Connect to PostgreSQL database
  clean           Remove all containers, networks, volumes, and images
  help            Show this help message

Examples:
  $0 start              # Start all services
  $0 logs app           # Show application logs
  $0 logs db            # Show database logs
  $0 exec-app bash      # Open bash shell in app container
  $0 db-shell           # Connect to PostgreSQL
  $0 rebuild            # Rebuild everything from scratch

Environment:
  Database: localhost:5432
  Application: http://localhost:8000
  Database credentials: myuser / mysecretpassword
EOF
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
    build)
        build "${@:2}"
        ;;
    rebuild)
        rebuild
        ;;
    logs)
        logs "$@"
        ;;
    status)
        status
        ;;
    exec-app)
        exec_app "${@:2}"
        ;;
    exec-db)
        exec_db "${@:2}"
        ;;
    db-shell)
        db_shell
        ;;
    clean)
        clean
        ;;
    help|--help|-h|"")
        help
        ;;
    *)
        print_error "Unknown command: $1"
        echo ""
        help
        exit 1
        ;;
esac

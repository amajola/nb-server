#!/usr/bin/env bash
set -e

# === CONFIGURATION ===
CONTAINER_NAME="mypostgres"
POSTGRES_VERSION="15"
POSTGRES_USER="myuser"
POSTGRES_PASSWORD="mypassword"
POSTGRES_DB="mydb"
VOLUME_NAME="pgdata"
PORT="5432"

echo "🚀 Setting up PostgreSQL in Podman..."

# 1. Pull the image
echo "➡️ Pulling postgres:$POSTGRES_VERSION image..."
podman pull docker.io/library/postgres:$POSTGRES_VERSION

# 2. Create a volume if it doesn’t exist
if ! podman volume exists $VOLUME_NAME; then
  echo "➡️ Creating volume $VOLUME_NAME..."
  podman volume create $VOLUME_NAME
else
  echo "✅ Volume $VOLUME_NAME already exists."
fi

# 3. Remove existing container if needed
if podman ps -a --format "{{.Names}}" | grep -Eq "^$CONTAINER_NAME\$"; then
  echo "⚠️ Container $CONTAINER_NAME already exists. Removing..."
  podman rm -f $CONTAINER_NAME
fi

# 4. Run PostgreSQL container
echo "➡️ Starting PostgreSQL container..."
podman run -d \
  --name $CONTAINER_NAME \
  -e POSTGRES_USER=$POSTGRES_USER \
  -e POSTGRES_PASSWORD=$POSTGRES_PASSWORD \
  -e POSTGRES_DB=$POSTGRES_DB \
  -v $VOLUME_NAME:/var/lib/postgresql/data \
  -p $PORT:5432 \
  --restart=always \
  postgres:$POSTGRES_VERSION

echo "✅ PostgreSQL is running!"
echo "   - User: $POSTGRES_USER"
echo "   - Password: $POSTGRES_PASSWORD"
echo "   - Database: $POSTGRES_DB"
echo "   - Port: $PORT"
echo ""
echo "👉 Connect using: psql -h localhost -U $POSTGRES_USER -d $POSTGRES_DB"

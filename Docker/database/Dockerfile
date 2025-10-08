# Use the official postgres image as base
FROM postgres:15

# Environment variables will be passed at runtime via docker-compose
# No hardcoded credentials here

# Expose PostgreSQL port
EXPOSE 5432

# Data will be persisted in a mounted volume
VOLUME ["/var/lib/postgresql/data"]

# Default command
CMD ["postgres"]

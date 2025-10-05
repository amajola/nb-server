# Use the official postgres image as base
FROM postgres:15

# Set environment variables
ENV POSTGRES_USER=myuser
ENV POSTGRES_PASSWORD=mysecretpassword
ENV POSTGRES_DB=mydb

# Expose PostgreSQL port
EXPOSE 5432

# Data will be persisted in a mounted volume
VOLUME ["/var/lib/postgresql/data"]

# Default command
CMD ["postgres"]

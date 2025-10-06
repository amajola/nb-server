# Use the official Deno image
FROM denoland/deno:2.5.3

# Set working directory
WORKDIR /app

# Set environment for production
ENV NODE_ENV=production

# Copy application files
COPY deno.json .
COPY deno.lock* .
COPY src ./src
COPY drizzle.config.ts .
COPY drizzle ./drizzle

# Expose the application port
EXPOSE 8000/tcp

# Run migrations and start the app (dependencies will be cached on first run)
CMD ["sh", "-c", "deno run --allow-all npm:drizzle-kit migrate && deno serve --allow-all src/index.ts"]

#!/bin/sh
set -e

# Sync migration files and schema into /app/prisma when a host volume is mounted
if [ -d /app/prisma-template ]; then
  mkdir -p /app/prisma/migrations
  cp -r /app/prisma-template/schema.prisma /app/prisma/ 2>/dev/null || true
  cp -r /app/prisma-template/migrations/* /app/prisma/migrations/ 2>/dev/null || true
fi

# Run database migrations before booting Next.js
echo "Applying database migrations..."
npx prisma migrate deploy

# Start Next.js standalone application
echo "Starting Next.js application..."
exec node server.js

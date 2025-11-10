#!/bin/sh
set -e

echo "Starting Angular SPA on Azure App Service..."
echo "Current directory: $(pwd)"
echo "Files in wwwroot:"
ls -la /home/site/wwwroot

# Install PM2 globally if not present
if ! command -v pm2 &> /dev/null; then
    echo "Installing PM2..."
    npm install -g pm2
fi

# Start the app using PM2 to serve static files
echo "Starting PM2 server..."
pm2 serve /home/site/wwwroot 8080 --spa --name gym-spa-frontend --no-daemon

echo "Application started successfully!"

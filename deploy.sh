#!/bin/bash

# Ouma-Ge Fast Deployment Script
# This script builds and deploys the Ouma-Ge app for production

echo "🚀 Starting Ouma-Ge Fast Deployment..."

# Set Node.js path
export PATH=./node-v20.11.1-darwin-x64/bin:$PATH

# Build the application
echo "📦 Building application..."
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build completed successfully!"

    # Start preview server for testing
    echo "🌐 Starting preview server on http://localhost:4174"
    echo "📱 Test your app at: http://localhost:4174"
    echo ""
    echo "🎉 Deployment ready! The built files are in the 'dist' folder."
    echo "   You can now:"
    echo "   - Upload the 'dist' folder to your web server"
    echo "   - Deploy to hosting platforms like Netlify, Vercel, or GitHub Pages"
    echo "   - Serve the files with any static file server"
    echo ""
    echo "💡 For production deployment, serve the 'dist' folder contents."

    # Optional: Start preview server
    npm run preview &
else
    echo "❌ Build failed! Please check the errors above."
    exit 1
fi

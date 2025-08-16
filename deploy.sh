#!/bin/bash

echo "🚀 Royal Studio - Vercel Deployment Script"
echo "=========================================="

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Build frontend
echo "📦 Building frontend..."
cd frontend
npm install
npm run build
cd ..

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
vercel --prod

echo "✅ Deployment complete!"
echo "📝 Don't forget to set environment variables in Vercel dashboard:"
echo "   - HUGGINGFACE_API_KEY"
echo "   - TWILIO_ACCOUNT_SID (optional)"
echo "   - TWILIO_AUTH_TOKEN (optional)"
echo "   - TWILIO_PHONE_NUMBER (optional)"

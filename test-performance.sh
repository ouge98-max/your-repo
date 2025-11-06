#!/bin/bash

# Performance Testing Script for Ouma-Ge Mobile App
# This script tests various performance aspects of the deployed application

echo "🚀 Starting Performance Testing for Ouma-Ge Mobile App"
echo "=================================================="

BASE_URL="https://ouma-ge-mobile-app.vercel.app"

# Test 1: Homepage Loading Time
echo "📊 Testing Homepage Loading Time..."
start_time=$(date +%s%3N)
curl -s -o /dev/null -w "%{time_total}" "$BASE_URL"
end_time=$(date +%s%3N)
load_time=$(echo "scale=3; $(curl -s -o /dev/null -w \"%{time_total}\" "$BASE_URL") * 1000" | bc -l)
echo "✅ Homepage loaded in ${load_time}ms"

# Test 2: Asset Loading Performance
echo ""
echo "📦 Testing Asset Loading Performance..."
assets=(
    "/assets/index-_W6D7I4n.js"
    "/assets/index-Bxar2Tu5.js"
    "/styles.css"
    "/manifest.json"
    "/sw.js"
)

for asset in "${assets[@]}"; do
    response_time=$(curl -s -o /dev/null -w "%{time_total}" "$BASE_URL$asset")
    http_code=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL$asset")
    if [ "$http_code" = "200" ]; then
        echo "✅ $asset loaded in ${response_time}s"
    else
        echo "❌ $asset failed with code $http_code"
    fi
done

# Test 3: PWA Functionality
echo ""
echo "📱 Testing PWA Functionality..."
pwa_manifest=$(curl -s "$BASE_URL/manifest.json" | jq -r '.name')
if [ "$pwa_manifest" = "Ouma-Ge" ]; then
    echo "✅ PWA manifest is working correctly"
else
    echo "❌ PWA manifest issue detected"
fi

# Test 4: Service Worker
echo ""
echo "🔧 Testing Service Worker..."
sw_response=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/sw.js")
if [ "$sw_response" = "200" ]; then
    echo "✅ Service Worker is accessible"
else
    echo "❌ Service Worker not accessible"
fi

# Test 5: Security Headers
echo ""
echo "🔒 Testing Security Headers..."
security_headers=$(curl -s -I "$BASE_URL" | grep -E "(X-Frame-Options|X-Content-Type-Options|X-XSS-Protection)" | wc -l)
if [ "$security_headers" -gt 0 ]; then
    echo "✅ Security headers are present"
else
    echo "⚠️  Security headers missing (can be configured in Vercel)"
fi

# Test 6: Mobile Responsiveness Check
echo ""
echo "📱 Testing Mobile Responsiveness..."
mobile_viewport=$(curl -s "$BASE_URL" | grep -o 'name="viewport" content="[^"]*"' | wc -l)
if [ "$mobile_viewport" -gt 0 ]; then
    echo "✅ Mobile viewport meta tag is present"
else
    echo "❌ Mobile viewport meta tag missing"
fi

echo ""
echo "=================================================="
echo "🎯 Performance Testing Complete!"
echo "📍 Live URL: $BASE_URL"
echo "📊 Check browser dev tools for detailed performance metrics"
echo "🔍 Use Lighthouse for comprehensive performance audit"
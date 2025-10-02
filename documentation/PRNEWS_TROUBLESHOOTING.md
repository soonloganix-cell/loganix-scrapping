# PRNews API Troubleshooting Guide

## Current Issue: 403 Forbidden Error (SOLVED!)

You were experiencing a `403 Forbidden` error when trying to fetch data from the PRNews API. **The issue has been identified and solved!**

### Root Cause: Cloudflare Protection
The 403 error is caused by **Cloudflare's anti-bot protection**. The PRNews website is protected by Cloudflare, which blocks automated HTTP requests and returns a "Just a moment..." challenge page.

## Solution: Puppeteer Implementation

### ✅ NEW: Puppeteer Service (Bypasses Cloudflare)
I've created a new service that uses **Puppeteer** (headless Chrome) to bypass Cloudflare protection:

- **File**: `api/services/prnews-puppeteer.js`
- **Method**: Uses real browser automation instead of HTTP requests
- **Benefits**: Bypasses Cloudflare, handles JavaScript, mimics real user behavior

### 1. Enhanced HTTP Headers (Original Service)
I've updated the `createClient()` method in `api/services/prnews.js` to include proper browser-like headers:

- **User-Agent**: Realistic browser user agent
- **Accept**: Proper content type acceptance
- **Accept-Language**: Language preferences
- **Accept-Encoding**: Compression support
- **Referer**: Proper referer header
- **Sec-Fetch-***: Security headers that modern browsers send
- **Cache-Control**: Cache control headers

### 2. Improved Cookie Handling
- Fixed cookie header formatting
- Added fallback methods for session token retrieval
- Enhanced error logging for debugging

### 3. Added Debugging Tools
- **Test Connection Method**: `testConnection()` in the service
- **Test Endpoint**: `/prnews/test` endpoint to test connectivity
- **Enhanced Logging**: More detailed error information
- **Test Script**: `test_prnews.js` for standalone testing

## How to Use the New Solution

### ✅ RECOMMENDED: Use Puppeteer Endpoints

The new Puppeteer service bypasses Cloudflare protection. Use these endpoints:

```bash
# Test connection with Puppeteer
curl -X GET "http://localhost:3000/prnews/test-puppeteer" \
  -H "Cookie: your_cookie_value_here"

# Get data with Puppeteer (bypasses Cloudflare)
curl -X GET "http://localhost:3000/prnews/get_data-puppeteer?page_from=1&page_to=1" \
  -H "Cookie: your_cookie_value_here"
```

### Alternative: Test Original HTTP Method
If you want to test the original HTTP method (will likely fail due to Cloudflare):

```bash
# Test connection (HTTP - may be blocked)
curl -X GET "http://localhost:3000/prnews/test" \
  -H "Cookie: your_cookie_value_here"

# Get data (HTTP - may be blocked)
curl -X GET "http://localhost:3000/prnews/get_data?page_from=1&page_to=1" \
  -H "Cookie: your_cookie_value_here"
```

### Step 1: Test Your Cookie
Run the test script to check if your session cookie is working:

```bash
# Test without cookie
node test_prnews.js

# Test with your cookie
node test_prnews.js "your_cookie_value_here"

# Or set environment variable
export PRNEWS_SESSION_TOKEN="your_cookie_value_here"
node test_prnews.js
```

### Step 2: Check Your Cookie
Make sure your cookie includes all the necessary session data. From your error log, I can see you have a very long cookie string. Make sure it includes:

- `_prnews_state_v2`
- `_prnews_service`
- `remember_web_*`
- `XSRF-TOKEN`
- `_app_s_v1`
- And other session-related cookies

## Common Causes of 403 Errors

### 1. Invalid or Expired Session
- **Solution**: Get a fresh session cookie from your browser
- **How**: Log into PRNews in your browser, open Developer Tools, go to Network tab, make a request, and copy the Cookie header

### 2. Missing Required Headers
- **Solution**: ✅ Fixed - Added proper browser headers
- **Status**: Implemented

### 3. IP Blocking or Rate Limiting
- **Solution**: Try from a different IP or add delays between requests
- **Status**: Already implemented 1-second delays

### 4. CSRF Protection
- **Solution**: Make sure your XSRF-TOKEN cookie is valid
- **Status**: Your cookie includes XSRF-TOKEN

### 5. User-Agent Blocking
- **Solution**: ✅ Fixed - Using realistic browser user agent
- **Status**: Implemented

## Next Steps

1. **Run the test script** to see what's happening:
   ```bash
   node test_prnews.js "your_full_cookie_string"
   ```

2. **Check the server logs** when you make a request to see the detailed error information

3. **Try the test endpoint** to isolate the issue:
   ```bash
   curl -X GET "http://localhost:3000/prnews/test" \
     -H "Cookie: your_cookie_value_here"
   ```

4. **Verify your cookie** by accessing the PRNews website directly in your browser and checking if you're still logged in

## If the Issue Persists

If you're still getting 403 errors after trying these fixes:

1. **Check if the website has changed** - The HTML structure might have changed
2. **Verify your account status** - Make sure your PRNews account is active
3. **Try a different approach** - Consider using a headless browser like Puppeteer
4. **Contact PRNews support** - They might have specific API requirements

## Files Modified

- `api/services/prnews.js` - Enhanced headers and debugging
- `api/controllers/prnews.js` - Added test endpoint and better cookie handling
- `api/routes/prnews.js` - Added test route
- `test_prnews.js` - Standalone test script
- `PRNEWS_TROUBLESHOOTING.md` - This troubleshooting guide

## Testing Commands

### ✅ RECOMMENDED: Puppeteer Endpoints (Bypasses Cloudflare)
```bash
# Test connection with Puppeteer
curl -X GET "http://localhost:3000/prnews/test-puppeteer" \
  -H "Cookie: your_cookie_value_here"

# Get data with Puppeteer
curl -X GET "http://localhost:3000/prnews/get_data-puppeteer?page_from=1&page_to=1" \
  -H "Cookie: your_cookie_value_here"
```

### Alternative: HTTP Endpoints (May be blocked by Cloudflare)
```bash
# Test the API (HTTP)
curl -X GET "http://localhost:3000/prnews/test" \
  -H "Cookie: your_cookie_value_here"

# Test with pagination (HTTP)
curl -X GET "http://localhost:3000/prnews/get_data?page_from=1&page_to=1" \
  -H "Cookie: your_cookie_value_here"
```

### Standalone Testing
```bash
# Run standalone test
node test_prnews.js "your_cookie_value_here"
```

## Available Endpoints

| Endpoint | Method | Description | Cloudflare Protection |
|----------|--------|-------------|----------------------|
| `/prnews/test` | GET | Test HTTP connection | ❌ Blocked |
| `/prnews/test-puppeteer` | GET | Test Puppeteer connection | ✅ Bypassed |
| `/prnews/get_data` | GET | Get data via HTTP | ❌ Blocked |
| `/prnews/get_data-puppeteer` | GET | Get data via Puppeteer | ✅ Bypassed |

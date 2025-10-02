#!/usr/bin/env node

/**
 * Test script for PRNews API connection
 * This script helps debug the 403 Forbidden error
 */

const axios = require('axios');

// Test function to check PRNews connection
async function testPRNewsConnection() {
  console.log('🔍 Testing PRNews API connection...\n');

  // Test 1: Basic connection without cookies
  console.log('Test 1: Basic connection without cookies');
  try {
    const response = await axios.get('https://prnews.io/sites', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Referer': 'https://prnews.io/',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'same-origin',
        'Cache-Control': 'max-age=0'
      }
    });
    console.log(`✅ Status: ${response.status}`);
    console.log(`📄 Content-Type: ${response.headers['content-type']}`);
    console.log(`🍪 Set-Cookie: ${response.headers['set-cookie'] ? 'Yes' : 'No'}`);
  } catch (error) {
    console.log(`❌ Error: ${error.response?.status} - ${error.message}`);
    if (error.response?.headers) {
      console.log(`📋 Response Headers:`, Object.keys(error.response.headers));
    }
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Test 2: Connection with your cookie (if provided)
  const cookieValue = process.env.PRNEWS_SESSION_TOKEN || process.argv[2];
  if (cookieValue) {
    console.log('Test 2: Connection with your session cookie');
    try {
      const response = await axios.get('https://prnews.io/sites', {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate, br',
          'Referer': 'https://prnews.io/',
          'Upgrade-Insecure-Requests': '1',
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'same-origin',
          'Cache-Control': 'max-age=0',
          'Cookie': cookieValue
        }
      });
      console.log(`✅ Status: ${response.status}`);
      console.log(`📄 Content-Type: ${response.headers['content-type']}`);
      console.log(`📏 Content Length: ${response.data.length} characters`);
    } catch (error) {
      console.log(`❌ Error: ${error.response?.status} - ${error.message}`);
      if (error.response?.data) {
        console.log(`📄 Response Data (first 200 chars):`, error.response.data.substring(0, 200));
      }
    }
  } else {
    console.log('Test 2: Skipped (no cookie provided)');
    console.log('💡 To test with your cookie, run:');
    console.log('   node test_prnews.js "your_cookie_value_here"');
    console.log('   or set PRNEWS_SESSION_TOKEN environment variable');
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Test 3: Test the specific page endpoint
  console.log('Test 3: Testing the specific page endpoint');
  try {
    const response = await axios.get('https://prnews.io/sites/page/1/perpage/96', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Referer': 'https://prnews.io/sites',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'same-origin',
        'Cache-Control': 'max-age=0',
        'Cookie': cookieValue || ''
      }
    });
    console.log(`✅ Status: ${response.status}`);
    console.log(`📄 Content-Type: ${response.headers['content-type']}`);
    console.log(`📏 Content Length: ${response.data.length} characters`);
  } catch (error) {
    console.log(`❌ Error: ${error.response?.status} - ${error.message}`);
    if (error.response?.data) {
      console.log(`📄 Response Data (first 200 chars):`, error.response.data.substring(0, 200));
    }
  }

  console.log('\n🔍 Debugging Tips:');
  console.log('1. Make sure your session cookie is valid and not expired');
  console.log('2. Check if the cookie format is correct (should include all cookies from browser)');
  console.log('3. Try accessing the URL directly in your browser to see if it works');
  console.log('4. Check if there are any additional headers required by the server');
  console.log('5. Verify that your IP is not blocked by the server');
}

// Run the test
testPRNewsConnection().catch(console.error);

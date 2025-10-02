#!/usr/bin/env node

/**
 * Test script for PRNews Puppeteer service
 * This script tests the Puppeteer implementation
 */

const PrNewsPuppeteerService = require('../api/services/prnews-puppeteer');

async function testPuppeteerService() {
  console.log('🤖 Testing PRNews Puppeteer Service...\n');

  // Get session token from environment or command line
  const sessionToken = process.env.PRNEWS_SESSION_TOKEN || process.argv[2];
  
  if (!sessionToken) {
    console.log('❌ No session token provided');
    console.log('💡 Usage: node test_puppeteer.js "your_cookie_value_here"');
    console.log('💡 Or set: export PRNEWS_SESSION_TOKEN="your_cookie_value_here"');
    return;
  }

  const service = new PrNewsPuppeteerService(sessionToken);

  try {
    // Test 1: Connection test
    console.log('Test 1: Testing connection...');
    const connectionResult = await service.testConnection();
    
    if (connectionResult.success) {
      console.log('✅ Connection successful!');
      console.log(`📄 Page title: ${connectionResult.title}`);
      console.log(`🌐 Final URL: ${connectionResult.url}`);
    } else {
      console.log('❌ Connection failed:', connectionResult.error);
    }

    // Close browser after test
    await service.closeBrowser();

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    await service.closeBrowser();
  }
}

// Run the test
testPuppeteerService().catch(console.error);

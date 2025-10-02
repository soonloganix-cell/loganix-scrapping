#!/usr/bin/env node

/**
 * Simple Puppeteer test to isolate the hanging issue
 */

const puppeteer = require('puppeteer');

async function simpleTest() {
  console.log('🚀 Starting simple Puppeteer test...');
  
  let browser = null;
  
  try {
    // Launch browser with minimal options
    console.log('1. Launching browser...');
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox'
      ]
    });
    console.log('✅ Browser launched');

    const page = await browser.newPage();
    console.log('✅ Page created');

    // Test with a simple page first
    console.log('2. Testing with simple page...');
    await page.goto('https://httpbin.org/user-agent', { 
      waitUntil: 'domcontentloaded',
      timeout: 10000 
    });
    console.log('✅ Simple page loaded');

    // Now test with PRNews
    console.log('3. Testing with PRNews...');
    await page.goto('https://prnews.io/sites', { 
      waitUntil: 'domcontentloaded',
      timeout: 15000 
    });
    console.log('✅ PRNews page loaded');

    const title = await page.title();
    console.log(`📄 Page title: ${title}`);

    // Check for the selector
    const hasCards = await page.$('.cards');
    console.log(`🔍 .cards selector: ${hasCards ? 'Found' : 'Not found'}`);

    console.log('✅ Test completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    if (browser) {
      console.log('🔒 Closing browser...');
      await browser.close();
    }
  }
}

// Add timeout to prevent hanging
const timeout = setTimeout(() => {
  console.error('⏰ Test timed out after 60 seconds');
  process.exit(1);
}, 60000);

simpleTest()
  .then(() => {
    clearTimeout(timeout);
    console.log('🎉 Test finished');
  })
  .catch((error) => {
    clearTimeout(timeout);
    console.error('💥 Test crashed:', error);
    process.exit(1);
  });

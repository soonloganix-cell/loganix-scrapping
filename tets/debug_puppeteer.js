#!/usr/bin/env node

/**
 * Debug script for PRNews Puppeteer issues
 * This script helps debug selector and permission issues
 */

const puppeteer = require('puppeteer');
const fs = require('fs');

async function debugPuppeteer() {
  console.log('🔍 Debugging Puppeteer issues...\n');

  let browser = null;
  let page = null;

  try {
    // Test 1: Basic browser launch
    console.log('Test 1: Launching browser...');
    browser = await puppeteer.launch({
      headless: false, // Show browser for debugging
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--disable-gpu',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor',
        '--disable-extensions',
        '--disable-plugins',
        '--user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      ]
    });

    console.log('✅ Browser launched successfully');

    page = await browser.newPage();
    await page.setViewport({ width: 1366, height: 768 });

    // Test 2: Navigate to a simple page first
    console.log('\nTest 2: Testing basic navigation...');
    await page.goto('https://httpbin.org/user-agent', { waitUntil: 'networkidle2' });
    const userAgent = await page.evaluate(() => document.body.textContent);
    console.log('✅ Basic navigation works');
    console.log(`📄 User agent: ${userAgent.substring(0, 100)}...`);

    // Test 3: Navigate to PRNews
    console.log('\nTest 3: Testing PRNews navigation...');
    await page.goto('https://prnews.io/sites', { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });

    const pageTitle = await page.title();
    const currentUrl = page.url();
    console.log(`📄 Page title: ${pageTitle}`);
    console.log(`🌐 Current URL: ${currentUrl}`);

    // Test 4: Check for selectors
    console.log('\nTest 4: Checking for selectors...');
    
    const selectors = [
      '.cards',
      '[class*="card"]',
      '[data-platform-info]',
      '.card_url',
      '.card_price',
      '.card_audience',
      '.card_badge'
    ];

    for (const selector of selectors) {
      const element = await page.$(selector);
      console.log(`  - ${selector}: ${element ? '✅ Found' : '❌ Not found'}`);
    }

    // Test 5: Get page content
    console.log('\nTest 5: Analyzing page content...');
    const pageContent = await page.content();
    console.log(`📏 Page content length: ${pageContent.length} characters`);

    // Save HTML for inspection
    fs.writeFileSync('debug_prnews_page.html', pageContent);
    console.log('💾 Saved page HTML to debug_prnews_page.html');

    // Test 6: Check if it's a Cloudflare challenge
    if (pageTitle.includes('Just a moment') || currentUrl.includes('challenge')) {
      console.log('⚠️  Detected Cloudflare challenge page');
      console.log('⏳ Waiting 10 seconds for Cloudflare to resolve...');
      await page.waitForTimeout(10000);
      
      // Check again
      const newTitle = await page.title();
      const newUrl = page.url();
      console.log(`📄 New page title: ${newTitle}`);
      console.log(`🌐 New URL: ${newUrl}`);
    }

    console.log('\n✅ Debug completed successfully!');
    console.log('💡 Check debug_prnews_page.html to see what was actually loaded');

  } catch (error) {
    console.error('❌ Debug failed:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    if (browser) {
      console.log('\n🔒 Closing browser...');
      await browser.close();
    }
  }
}

// Run the debug
debugPuppeteer().catch(console.error);

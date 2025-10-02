#!/usr/bin/env node

/**
 * Manual data collection script for PRNews
 * This script helps you collect data manually when automated methods fail
 */

// Load environment variables
require('dotenv').config({ path: '../../.env' });

const fs = require('fs');
const cheerio = require('cheerio');
const PrNewsDomainsRepository = require('../../api/repositories/prnews_domains');
const { sequelize } = require('../../config/database');

function extractDataFromHTML(html) {
  try {
    const domainsData = [];
    const $ = cheerio.load(html);
    
    // Find the cards container
    const $cardsContainer = $('.cards');
    if ($cardsContainer.length === 0) {
      console.log('❌ No cards container found in HTML');
      return domainsData;
    }
    
    // Find all card divs with data-platform-info attribute
    $cardsContainer.find('div[data-platform-info]').each((index, element) => {
      const $card = $(element);
      
      // Extract data
      const url = $card.find('.card_url').text().trim();
      const price = $card.find('.card_price').text().trim();
      const audience = $card.find('.card_audience').text().trim();
      const classValue = $card.find('.card_badge').text().trim();
      
      if (url) {
        domainsData.push({
          url: url,
          price: price || null,
          audience: audience || null,
          class: classValue || null
        });
      }
    });
    
    console.log(`✅ Extracted ${domainsData.length} domains from HTML`);
    return domainsData;
    
  } catch (error) {
    console.error('Error parsing HTML:', error.message);
    return [];
  }
}

async function insertDataToDatabase(data) {
  try {
    console.log('🗄️  Connecting to database...');
    
    // Initialize repository
    const prNewsDomainsRepo = new PrNewsDomainsRepository(sequelize);
    
    // Insert data using bulkCreate
    console.log(`📥 Inserting ${data.length} domains into database...`);
    const result = await prNewsDomainsRepo.bulkCreate(data);
    
    if (result.success) {
      console.log(`✅ Successfully inserted ${result.count} domains into database`);
      return { success: true, count: result.count };
    } else {
      console.error('❌ Failed to insert data:', result.error);
      return { success: false, error: result.error };
    }
    
  } catch (error) {
    console.error('❌ Database error:', error.message);
    return { success: false, error: error.message };
  }
}

// Main function
async function main() {
  console.log('📋 Manual PRNews Data Collection Tool');
  console.log('=====================================\n');
  
  console.log('Instructions:');
  console.log('1. Open your browser and go to https://prnews.io/sites');
  console.log('2. Make sure you are logged in');
  console.log('3. Navigate to the page you want to scrape (e.g., page 1)');
  console.log('4. Right-click on the page and select "View Page Source"');
  console.log('5. Copy all the HTML content');
  console.log('6. Save it to a file called "page_source.html" in the manual/prnews directory');
  console.log('7. Run this script again\n');
  
  // Check if HTML file exists
  if (fs.existsSync('page_source.html')) {
    console.log('📄 Found page_source.html, processing...\n');
    
    try {
      const html = fs.readFileSync('page_source.html', 'utf8');
      console.log(`📏 HTML file size: ${html.length} characters`);
      
      // Extract data
      const domainsData = extractDataFromHTML(html);
      
      if (domainsData.length > 0) {
        console.log('\n✅ Data extraction completed!');
        console.log(`📊 Found ${domainsData.length} domains`);
        
        // Show sample data
        console.log('\n📋 Sample data:');
        domainsData.slice(0, 3).forEach((item, index) => {
          console.log(`${index + 1}. ${item.url} - ${item.price} - ${item.audience} - ${item.class}`);
        });
        
        // Insert data into database
        console.log('\n🗄️  Inserting data into database...');
        const dbResult = await insertDataToDatabase(domainsData);
        
        if (dbResult.success) {
          console.log(`\n🎉 Successfully processed ${dbResult.count} domains!`);
          console.log('✅ Data has been saved to the prnews_domains table');
        } else {
          console.log('\n❌ Failed to save data to database');
          console.log(`Error: ${dbResult.error}`);
        }
        
      } else {
        console.log('❌ No data found in the HTML file');
        console.log('💡 Make sure you copied the complete page source');
      }
      
    } catch (error) {
      console.error('❌ Error processing HTML file:', error.message);
    }
    
  } else {
    console.log('❌ page_source.html not found');
    console.log('💡 Please follow the instructions above to create the file');
    console.log('💡 Make sure the file is saved in the same directory as this script');
  }
}

// Run the script
main().catch(console.error);

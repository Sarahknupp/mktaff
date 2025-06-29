import { HotmartScraper } from './hotmart-scraper.js';
import { EduzzScraper } from './eduzz-scraper.js';
import { KiwiPayScraper } from './kiwipay-scraper.js';
import logger from '../utils/logger.js';
import fs from 'fs/promises';
import path from 'path';

class ScrapingManager {
  constructor() {
    this.scrapers = {
      hotmart: new HotmartScraper(),
      eduzz: new EduzzScraper(),
      kiwipay: new KiwiPayScraper()
    };
    this.dataPath = './data/products.json';
  }

  async scrapeAllPlatforms(searchTerms, productsPerPlatform = 10) {
    const allProducts = [];
    
    try {
      logger.info('Starting comprehensive scraping across all platforms');
      
      for (const term of searchTerms) {
        logger.info(`Scraping for search term: ${term}`);
        
        for (const [platform, scraper] of Object.entries(this.scrapers)) {
          try {
            logger.info(`Scraping ${platform} for term: ${term}`);
            
            const products = await scraper.scrapeProducts(term, productsPerPlatform);
            allProducts.push(...products);
            
            logger.info(`Successfully scraped ${products.length} products from ${platform}`);
            
            // Delay between platforms to avoid overwhelming servers
            await this.delay(3000);
            
          } catch (error) {
            logger.error(`Error scraping ${platform} for term ${term}:`, error);
            continue;
          }
        }
        
        // Delay between search terms
        await this.delay(5000);
      }
      
      // Save products to file
      await this.saveProducts(allProducts);
      
      logger.info(`Scraping completed. Total products found: ${allProducts.length}`);
      return allProducts;
      
    } catch (error) {
      logger.error('Error in comprehensive scraping:', error);
      throw error;
    } finally {
      // Close all drivers
      await this.closeAllDrivers();
    }
  }

  async saveProducts(products) {
    try {
      // Ensure data directory exists
      const dataDir = path.dirname(this.dataPath);
      await fs.mkdir(dataDir, { recursive: true });
      
      // Load existing products
      let existingProducts = [];
      try {
        const existingData = await fs.readFile(this.dataPath, 'utf8');
        existingProducts = JSON.parse(existingData);
      } catch {
        // File doesn't exist or is invalid, start fresh
      }
      
      // Merge new products with existing ones (avoid duplicates)
      const mergedProducts = this.mergeProducts(existingProducts, products);
      
      // Save to file
      await fs.writeFile(this.dataPath, JSON.stringify(mergedProducts, null, 2));
      
      logger.info(`Saved ${mergedProducts.length} products to ${this.dataPath}`);
      
    } catch (error) {
      logger.error('Error saving products:', error);
      throw error;
    }
  }

  mergeProducts(existing, newProducts) {
    const merged = [...existing];
    
    for (const newProduct of newProducts) {
      // Check if product already exists (by title and platform)
      const existingIndex = merged.findIndex(p => 
        p.title === newProduct.title && p.platform === newProduct.platform
      );
      
      if (existingIndex >= 0) {
        // Update existing product with new data
        merged[existingIndex] = { ...merged[existingIndex], ...newProduct };
      } else {
        // Add new product
        merged.push(newProduct);
      }
    }
    
    return merged;
  }

  async closeAllDrivers() {
    for (const scraper of Object.values(this.scrapers)) {
      try {
        await scraper.closeDriver();
      } catch (error) {
        logger.error('Error closing scraper driver:', error);
      }
    }
  }

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async getProducts() {
    try {
      const data = await fs.readFile(this.dataPath, 'utf8');
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  async updateProductStatus(productId, status) {
    try {
      const products = await this.getProducts();
      const productIndex = products.findIndex(p => p.id === productId);
      
      if (productIndex >= 0) {
        products[productIndex].status = status;
        products[productIndex].updatedAt = new Date().toISOString();
        
        await fs.writeFile(this.dataPath, JSON.stringify(products, null, 2));
        logger.info(`Updated product ${productId} status to ${status}`);
        
        return products[productIndex];
      }
      
      throw new Error(`Product ${productId} not found`);
      
    } catch (error) {
      logger.error('Error updating product status:', error);
      throw error;
    }
  }
}

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const manager = new ScrapingManager();
  
  const searchTerms = process.argv.slice(2);
  if (searchTerms.length === 0) {
    searchTerms.push('marketing digital', 'curso online', 'ebook', 'treinamento');
  }
  
  manager.scrapeAllPlatforms(searchTerms)
    .then(products => {
      console.log(`Scraping completed successfully. Found ${products.length} products.`);
      process.exit(0);
    })
    .catch(error => {
      console.error('Scraping failed:', error);
      process.exit(1);
    });
}

export { ScrapingManager };
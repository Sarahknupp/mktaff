import { Builder, By, until } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';
import axios from 'axios';
import cheerio from 'cheerio';
import { config } from '../config/config.js';
import logger from '../utils/logger.js';

export class BaseScraper {
  constructor(platform) {
    this.platform = platform;
    this.driver = null;
    this.retryCount = 0;
    this.maxRetries = config.scraping.maxRetries;
  }

  async initializeDriver() {
    try {
      const options = new chrome.Options();
      options.addArguments('--headless');
      options.addArguments('--no-sandbox');
      options.addArguments('--disable-dev-shm-usage');
      options.addArguments(`--user-agent=${config.scraping.userAgent}`);
      options.addArguments('--disable-blink-features=AutomationControlled');
      options.setUserPreferences({
        'profile.default_content_setting_values.notifications': 2
      });

      this.driver = await new Builder()
        .forBrowser('chrome')
        .setChromeOptions(options)
        .build();

      logger.info(`Selenium driver initialized for ${this.platform}`);
      return true;
    } catch (error) {
      logger.error(`Failed to initialize Selenium driver for ${this.platform}:`, error);
      return false;
    }
  }

  async closeDriver() {
    if (this.driver) {
      await this.driver.quit();
      this.driver = null;
      logger.info(`Selenium driver closed for ${this.platform}`);
    }
  }

  async makeRequest(url, useSelenium = false) {
    try {
      if (useSelenium) {
        if (!this.driver) {
          await this.initializeDriver();
        }
        
        await this.driver.get(url);
        await this.driver.sleep(config.scraping.requestDelay);
        
        const pageSource = await this.driver.getPageSource();
        return cheerio.load(pageSource);
      } else {
        const response = await axios.get(url, {
          headers: {
            'User-Agent': config.scraping.userAgent,
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1'
          },
          timeout: config.scraping.timeout
        });
        
        return cheerio.load(response.data);
      }
    } catch (error) {
      if (this.retryCount < this.maxRetries) {
        this.retryCount++;
        logger.warn(`Request failed for ${url}, retrying (${this.retryCount}/${this.maxRetries})`);
        await this.delay(config.scraping.requestDelay * this.retryCount);
        return this.makeRequest(url, useSelenium);
      }
      
      logger.error(`Failed to make request to ${url} after ${this.maxRetries} retries:`, error);
      throw error;
    }
  }

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  validateProduct(product) {
    const required = ['title', 'price', 'description', 'affiliateLink', 'platform'];
    const missing = required.filter(field => !product[field]);
    
    if (missing.length > 0) {
      logger.warn(`Product validation failed. Missing fields: ${missing.join(', ')}`);
      return false;
    }
    
    // Validate price format
    if (typeof product.price !== 'number' || product.price <= 0) {
      logger.warn('Product validation failed. Invalid price format');
      return false;
    }
    
    // Validate URL format
    try {
      new URL(product.affiliateLink);
    } catch {
      logger.warn('Product validation failed. Invalid affiliate link URL');
      return false;
    }
    
    return true;
  }

  async scrapeProducts(searchTerm, limit = 10) {
    throw new Error('scrapeProducts method must be implemented by subclass');
  }
}
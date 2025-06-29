import { BaseScraper } from './base-scraper.js';
import { config } from '../config/config.js';
import logger from '../utils/logger.js';

export class EduzzScraper extends BaseScraper {
  constructor() {
    super('Eduzz');
  }

  async scrapeProducts(searchTerm, limit = 10) {
    const products = [];
    
    try {
      logger.info(`Starting Eduzz scraping for term: ${searchTerm}`);
      
      const searchUrl = `${config.platforms.eduzz.searchUrl}?q=${encodeURIComponent(searchTerm)}`;
      const $ = await this.makeRequest(searchUrl, true);
      
      const productElements = $('.product-item, .marketplace-item').slice(0, limit);
      
      for (let i = 0; i < productElements.length; i++) {
        try {
          const element = productElements.eq(i);
          
          const title = element.find('.product-name, .item-title').text().trim();
          const priceText = element.find('.price, .product-price').text().trim();
          const price = this.extractPrice(priceText);
          const description = element.find('.product-description, .item-description').text().trim();
          const productUrl = element.find('a').attr('href');
          const imageUrl = element.find('img').attr('src');
          const rating = element.find('.rating, .stars').text().trim();
          const sales = element.find('.sales, .sold-count').text().trim();
          
          if (!title || !price || !productUrl) {
            logger.warn('Skipping Eduzz product due to missing essential data');
            continue;
          }
          
          const product = {
            id: `eduzz_${Date.now()}_${i}`,
            title,
            price,
            description: description || 'Descrição não disponível',
            productUrl: this.buildFullUrl(productUrl),
            affiliateLink: await this.generateAffiliateLink(productUrl),
            imageUrl: this.buildFullUrl(imageUrl),
            platform: 'Eduzz',
            rating: this.extractRating(rating),
            sales: this.extractSales(sales),
            category: await this.extractCategory($, element),
            commission: await this.extractCommission(productUrl),
            scrapedAt: new Date().toISOString(),
            status: 'active'
          };
          
          if (this.validateProduct(product)) {
            products.push(product);
            logger.info(`Successfully scraped Eduzz product: ${title}`);
          }
          
          await this.delay(1000);
          
        } catch (error) {
          logger.error(`Error scraping individual Eduzz product:`, error);
          continue;
        }
      }
      
      logger.info(`Eduzz scraping completed. Found ${products.length} products`);
      return products;
      
    } catch (error) {
      logger.error('Error in Eduzz scraping:', error);
      throw error;
    }
  }

  extractPrice(priceText) {
    if (!priceText) return 0;
    
    const cleanPrice = priceText.replace(/[R$\s]/g, '').replace(',', '.');
    const price = parseFloat(cleanPrice);
    
    return isNaN(price) ? 0 : price;
  }

  extractRating(ratingText) {
    if (!ratingText) return 0;
    
    const rating = parseFloat(ratingText);
    return isNaN(rating) ? 0 : rating;
  }

  extractSales(salesText) {
    if (!salesText) return 0;
    
    const sales = parseInt(salesText.replace(/\D/g, ''));
    return isNaN(sales) ? 0 : sales;
  }

  buildFullUrl(url) {
    if (!url) return '';
    
    if (url.startsWith('http')) {
      return url;
    }
    
    return `${config.platforms.eduzz.baseUrl}${url.startsWith('/') ? url : '/' + url}`;
  }

  async generateAffiliateLink(productUrl) {
    try {
      const affiliateId = process.env.EDUZZ_AFFILIATE_ID || 'your_affiliate_id';
      const fullUrl = this.buildFullUrl(productUrl);
      
      return `${fullUrl}?ref=${affiliateId}&utm_source=tiktok&utm_medium=video&utm_campaign=automation`;
    } catch (error) {
      logger.error('Error generating Eduzz affiliate link:', error);
      return this.buildFullUrl(productUrl);
    }
  }

  async extractCategory($, element) {
    try {
      const categoryElement = element.find('.category, .product-category');
      return categoryElement.text().trim() || 'Geral';
    } catch {
      return 'Geral';
    }
  }

  async extractCommission(productUrl) {
    try {
      return 40; // Default Eduzz commission rate
    } catch {
      return 30;
    }
  }
}
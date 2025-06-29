import { BaseScraper } from './base-scraper.js';
import { config } from '../config/config.js';
import logger from '../utils/logger.js';

export class HotmartScraper extends BaseScraper {
  constructor() {
    super('Hotmart');
  }

  async scrapeProducts(searchTerm, limit = 10) {
    const products = [];
    
    try {
      logger.info(`Starting Hotmart scraping for term: ${searchTerm}`);
      
      const searchUrl = `${config.platforms.hotmart.searchUrl}?search=${encodeURIComponent(searchTerm)}`;
      const $ = await this.makeRequest(searchUrl, true);
      
      const productElements = $('.marketplace-product-card').slice(0, limit);
      
      for (let i = 0; i < productElements.length; i++) {
        try {
          const element = productElements.eq(i);
          
          const title = element.find('.product-title').text().trim();
          const priceText = element.find('.price-value').text().trim();
          const price = this.extractPrice(priceText);
          const description = element.find('.product-description').text().trim();
          const productUrl = element.find('a').attr('href');
          const imageUrl = element.find('img').attr('src');
          const rating = element.find('.rating-value').text().trim();
          const sales = element.find('.sales-count').text().trim();
          
          if (!title || !price || !productUrl) {
            logger.warn('Skipping product due to missing essential data');
            continue;
          }
          
          const product = {
            id: `hotmart_${Date.now()}_${i}`,
            title,
            price,
            description: description || 'Descrição não disponível',
            productUrl: this.buildFullUrl(productUrl),
            affiliateLink: await this.generateAffiliateLink(productUrl),
            imageUrl: this.buildFullUrl(imageUrl),
            platform: 'Hotmart',
            rating: this.extractRating(rating),
            sales: this.extractSales(sales),
            category: await this.extractCategory($, element),
            commission: await this.extractCommission(productUrl),
            scrapedAt: new Date().toISOString(),
            status: 'active'
          };
          
          if (this.validateProduct(product)) {
            products.push(product);
            logger.info(`Successfully scraped Hotmart product: ${title}`);
          }
          
          // Delay between products to avoid rate limiting
          await this.delay(1000);
          
        } catch (error) {
          logger.error(`Error scraping individual Hotmart product:`, error);
          continue;
        }
      }
      
      logger.info(`Hotmart scraping completed. Found ${products.length} products`);
      return products;
      
    } catch (error) {
      logger.error('Error in Hotmart scraping:', error);
      throw error;
    }
  }

  extractPrice(priceText) {
    if (!priceText) return 0;
    
    // Remove currency symbols and convert to number
    const cleanPrice = priceText.replace(/[R$\s.,]/g, '');
    const price = parseFloat(cleanPrice) / 100; // Assuming price is in cents
    
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
    
    return `${config.platforms.hotmart.baseUrl}${url.startsWith('/') ? url : '/' + url}`;
  }

  async generateAffiliateLink(productUrl) {
    try {
      // In a real implementation, you would use Hotmart's API to generate affiliate links
      // For now, we'll create a mock affiliate link
      const affiliateId = process.env.HOTMART_AFFILIATE_ID || 'your_affiliate_id';
      const fullUrl = this.buildFullUrl(productUrl);
      
      return `${fullUrl}?a=${affiliateId}&utm_source=tiktok&utm_medium=video&utm_campaign=automation`;
    } catch (error) {
      logger.error('Error generating Hotmart affiliate link:', error);
      return this.buildFullUrl(productUrl);
    }
  }

  async extractCategory($, element) {
    try {
      const categoryElement = element.find('.product-category');
      return categoryElement.text().trim() || 'Geral';
    } catch {
      return 'Geral';
    }
  }

  async extractCommission(productUrl) {
    try {
      // In a real implementation, you would fetch commission data from Hotmart's API
      // For now, we'll return a default commission rate
      return 50; // 50% commission rate
    } catch {
      return 30; // Default commission rate
    }
  }
}
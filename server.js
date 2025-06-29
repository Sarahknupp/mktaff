import express from 'express';
import cors from 'cors';
import { config } from './config/config.js';
import { ScrapingManager } from './scrapers/main.js';
import { VideoGenerator } from './video/generator.js';
import { TikTokUploader } from './tiktok/uploader.js';
import { AutomationScheduler } from './scheduler/automation.js';
import logger from './utils/logger.js';

const app = express();
const port = config.server.port;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('dist'));

// Initialize services
const scrapingManager = new ScrapingManager();
const videoGenerator = new VideoGenerator();
const tiktokUploader = new TikTokUploader();
const automationScheduler = new AutomationScheduler();

// API Routes

// Products endpoints
app.get('/api/products', async (req, res) => {
  try {
    const products = await scrapingManager.getProducts();
    res.json(products);
  } catch (error) {
    logger.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

app.post('/api/products/scrape', async (req, res) => {
  try {
    const { searchTerms, productsPerPlatform = 10 } = req.body;
    
    if (!searchTerms || !Array.isArray(searchTerms)) {
      return res.status(400).json({ error: 'searchTerms must be an array' });
    }
    
    const products = await scrapingManager.scrapeAllPlatforms(searchTerms, productsPerPlatform);
    res.json({ success: true, products });
    
  } catch (error) {
    logger.error('Error in manual scraping:', error);
    res.status(500).json({ error: 'Scraping failed' });
  }
});

app.put('/api/products/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const product = await scrapingManager.updateProductStatus(id, status);
    res.json(product);
    
  } catch (error) {
    logger.error('Error updating product status:', error);
    res.status(500).json({ error: 'Failed to update product status' });
  }
});

// Videos endpoints
app.get('/api/videos', async (req, res) => {
  try {
    const videos = await videoGenerator.getVideoList();
    res.json(videos);
  } catch (error) {
    logger.error('Error fetching videos:', error);
    res.status(500).json({ error: 'Failed to fetch videos' });
  }
});

app.post('/api/videos/generate', async (req, res) => {
  try {
    const { productId, options = {} } = req.body;
    
    const products = await scrapingManager.getProducts();
    const product = products.find(p => p.id === productId);
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    const video = await videoGenerator.generateVideo(product, options);
    res.json(video);
    
  } catch (error) {
    logger.error('Error generating video:', error);
    res.status(500).json({ error: 'Video generation failed' });
  }
});

// TikTok endpoints
app.post('/api/tiktok/upload', async (req, res) => {
  try {
    const { videoId, postOptions = {} } = req.body;
    
    const videos = await videoGenerator.getVideoList();
    const video = videos.find(v => v.id === videoId);
    
    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }
    
    // Create video data structure
    const videoData = {
      id: video.id,
      filePath: video.path,
      metadata: {
        product: 'Sample Product', // In real implementation, get from database
        platform: 'Hotmart',
        price: 297.00
      }
    };
    
    const result = await tiktokUploader.uploadVideo(videoData, postOptions);
    res.json(result);
    
  } catch (error) {
    logger.error('Error uploading to TikTok:', error);
    res.status(500).json({ error: 'TikTok upload failed' });
  }
});

app.post('/api/tiktok/schedule', async (req, res) => {
  try {
    const { videoId, scheduledTime, postOptions = {} } = req.body;
    
    const videos = await videoGenerator.getVideoList();
    const video = videos.find(v => v.id === videoId);
    
    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }
    
    const videoData = {
      id: video.id,
      filePath: video.path,
      metadata: {
        product: 'Sample Product',
        platform: 'Hotmart',
        price: 297.00
      }
    };
    
    const result = await tiktokUploader.schedulePost(videoData, scheduledTime, postOptions);
    res.json(result);
    
  } catch (error) {
    logger.error('Error scheduling TikTok post:', error);
    res.status(500).json({ error: 'TikTok scheduling failed' });
  }
});

app.get('/api/tiktok/metrics/:publishId', async (req, res) => {
  try {
    const { publishId } = req.params;
    const metrics = await tiktokUploader.getVideoMetrics(publishId);
    res.json(metrics);
  } catch (error) {
    logger.error('Error fetching TikTok metrics:', error);
    res.status(500).json({ error: 'Failed to fetch metrics' });
  }
});

// Automation endpoints
app.get('/api/automation/status', async (req, res) => {
  try {
    const status = await automationScheduler.getStatus();
    res.json(status);
  } catch (error) {
    logger.error('Error fetching automation status:', error);
    res.status(500).json({ error: 'Failed to fetch automation status' });
  }
});

app.post('/api/automation/start', async (req, res) => {
  try {
    automationScheduler.start();
    res.json({ success: true, message: 'Automation started' });
  } catch (error) {
    logger.error('Error starting automation:', error);
    res.status(500).json({ error: 'Failed to start automation' });
  }
});

app.post('/api/automation/stop', async (req, res) => {
  try {
    automationScheduler.stop();
    res.json({ success: true, message: 'Automation stopped' });
  } catch (error) {
    logger.error('Error stopping automation:', error);
    res.status(500).json({ error: 'Failed to stop automation' });
  }
});

// Analytics endpoints
app.get('/api/analytics/overview', async (req, res) => {
  try {
    const products = await scrapingManager.getProducts();
    const videos = await videoGenerator.getVideoList();
    
    const analytics = {
      totalProducts: products.length,
      activeProducts: products.filter(p => p.status === 'active').length,
      totalVideos: videos.length,
      videosToday: videos.filter(v => {
        const today = new Date().toDateString();
        return new Date(v.createdAt).toDateString() === today;
      }).length,
      platformDistribution: products.reduce((acc, product) => {
        acc[product.platform] = (acc[product.platform] || 0) + 1;
        return acc;
      }, {}),
      averagePrice: products.reduce((sum, p) => sum + p.price, 0) / products.length || 0
    };
    
    res.json(analytics);
    
  } catch (error) {
    logger.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0'
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  logger.error('Unhandled error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(port, () => {
  logger.info(`Server running on http://localhost:${port}`);
  console.log(`🚀 Affiliate Marketing Automation Server running on port ${port}`);
  console.log(`📊 Dashboard: http://localhost:${port}`);
  console.log(`🔧 API: http://localhost:${port}/api`);
});

export default app;
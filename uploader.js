import axios from 'axios';
import fs from 'fs/promises';
import FormData from 'form-data';
import { config } from '../config/config.js';
import logger from '../utils/logger.js';

export class TikTokUploader {
  constructor() {
    this.clientKey = config.tiktok.clientKey;
    this.clientSecret = config.tiktok.clientSecret;
    this.accessToken = config.tiktok.accessToken;
    this.apiUrl = config.tiktok.apiUrl;
    this.uploadUrl = config.tiktok.uploadUrl;
  }

  async uploadVideo(videoData, postOptions = {}) {
    try {
      logger.info(`Starting TikTok upload for video: ${videoData.id}`);
      
      // Step 1: Initialize upload session
      const uploadSession = await this.initializeUpload(videoData);
      
      // Step 2: Upload video file
      const uploadResult = await this.uploadVideoFile(uploadSession, videoData.filePath);
      
      // Step 3: Publish video
      const publishResult = await this.publishVideo(uploadResult, videoData, postOptions);
      
      logger.info(`TikTok upload completed successfully for video: ${videoData.id}`);
      return publishResult;
      
    } catch (error) {
      logger.error(`Error uploading video ${videoData.id} to TikTok:`, error);
      throw error;
    }
  }

  async initializeUpload(videoData) {
    try {
      const response = await axios.post(
        `${this.uploadUrl}/v2/post/publish/video/init/`,
        {
          post_info: {
            title: this.generateTitle(videoData),
            privacy_level: 'SELF_ONLY', // Change to 'PUBLIC_TO_EVERYONE' for public posts
            disable_duet: false,
            disable_comment: false,
            disable_stitch: false,
            video_cover_timestamp_ms: 1000
          },
          source_info: {
            source: 'FILE_UPLOAD',
            video_size: await this.getFileSize(videoData.filePath),
            chunk_size: 10000000, // 10MB chunks
            total_chunk_count: 1
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.data.error) {
        throw new Error(`TikTok API error: ${response.data.error.message}`);
      }
      
      logger.info(`Upload session initialized for video: ${videoData.id}`);
      return response.data.data;
      
    } catch (error) {
      logger.error('Error initializing TikTok upload:', error);
      throw error;
    }
  }

  async uploadVideoFile(uploadSession, filePath) {
    try {
      const fileBuffer = await fs.readFile(filePath);
      const formData = new FormData();
      
      formData.append('video', fileBuffer, {
        filename: 'video.mp4',
        contentType: 'video/mp4'
      });
      
      const response = await axios.put(
        uploadSession.upload_url,
        formData,
        {
          headers: {
            ...formData.getHeaders(),
            'Authorization': `Bearer ${this.accessToken}`
          },
          maxContentLength: Infinity,
          maxBodyLength: Infinity
        }
      );
      
      logger.info(`Video file uploaded successfully`);
      return {
        ...uploadSession,
        upload_response: response.data
      };
      
    } catch (error) {
      logger.error('Error uploading video file:', error);
      throw error;
    }
  }

  async publishVideo(uploadResult, videoData, postOptions) {
    try {
      const hashtags = this.generateHashtags(videoData, postOptions.hashtags);
      const description = this.generateDescription(videoData, postOptions.description);
      
      const response = await axios.post(
        `${this.apiUrl}/v2/post/publish/status/fetch/`,
        {
          publish_id: uploadResult.publish_id
        },
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      // Wait for processing to complete
      await this.waitForProcessing(uploadResult.publish_id);
      
      // Update video with description and hashtags
      const updateResponse = await axios.post(
        `${this.apiUrl}/v2/post/publish/video/update/`,
        {
          publish_id: uploadResult.publish_id,
          post_info: {
            description: `${description} ${hashtags}`,
            privacy_level: postOptions.privacy || 'PUBLIC_TO_EVERYONE'
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      logger.info(`Video published successfully to TikTok`);
      
      return {
        publishId: uploadResult.publish_id,
        status: 'published',
        tiktokUrl: updateResponse.data.share_url,
        publishedAt: new Date().toISOString()
      };
      
    } catch (error) {
      logger.error('Error publishing video:', error);
      throw error;
    }
  }

  async waitForProcessing(publishId, maxWaitTime = 300000) { // 5 minutes max
    const startTime = Date.now();
    
    while (Date.now() - startTime < maxWaitTime) {
      try {
        const response = await axios.post(
          `${this.apiUrl}/v2/post/publish/status/fetch/`,
          { publish_id: publishId },
          {
            headers: {
              'Authorization': `Bearer ${this.accessToken}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        const status = response.data.data.status;
        
        if (status === 'PROCESSING_DOWNLOAD') {
          logger.info('Video is being processed by TikTok...');
          await this.delay(10000); // Wait 10 seconds
          continue;
        }
        
        if (status === 'SEND_TO_USER_INBOX') {
          logger.info('Video processing completed');
          return true;
        }
        
        if (status === 'FAILED') {
          throw new Error('Video processing failed on TikTok');
        }
        
        await this.delay(5000); // Wait 5 seconds
        
      } catch (error) {
        logger.error('Error checking processing status:', error);
        throw error;
      }
    }
    
    throw new Error('Video processing timeout');
  }

  generateTitle(videoData) {
    const titles = [
      `${videoData.metadata.product} - Oferta Especial!`,
      `Descubra ${videoData.metadata.product}`,
      `${videoData.metadata.product} com Desconto!`,
      `Não Perca: ${videoData.metadata.product}`
    ];
    
    return titles[Math.floor(Math.random() * titles.length)];
  }

  generateDescription(videoData, customDescription) {
    if (customDescription) {
      return customDescription;
    }
    
    const descriptions = [
      `🔥 ${videoData.metadata.product} por apenas R$ ${videoData.metadata.price}! Não perca essa oportunidade única! Link na bio 👆`,
      `✨ Transforme sua vida com ${videoData.metadata.product}! Oferta especial por tempo limitado. Clique no link! 💫`,
      `🚀 ${videoData.metadata.product} - O curso que vai mudar sua vida! Por apenas R$ ${videoData.metadata.price}. Acesse agora! 🎯`,
      `💎 Oportunidade imperdível! ${videoData.metadata.product} com desconto especial. Link na bio! ⬆️`
    ];
    
    return descriptions[Math.floor(Math.random() * descriptions.length)];
  }

  generateHashtags(videoData, customHashtags) {
    const baseHashtags = [
      '#marketingdigital',
      '#cursoonline',
      '#oportunidade',
      '#transformacao',
      '#sucesso',
      '#empreendedorismo',
      '#dinheiro',
      '#negocio'
    ];
    
    const platformHashtags = {
      'Hotmart': ['#hotmart', '#produtodigital'],
      'Eduzz': ['#eduzz', '#afiliado'],
      'KiwiPay': ['#kiwipay', '#vendasonline']
    };
    
    let hashtags = [...baseHashtags];
    
    if (platformHashtags[videoData.metadata.platform]) {
      hashtags.push(...platformHashtags[videoData.metadata.platform]);
    }
    
    if (customHashtags && Array.isArray(customHashtags)) {
      hashtags.push(...customHashtags);
    }
    
    // Limit to 10 hashtags and ensure they start with #
    return hashtags
      .slice(0, 10)
      .map(tag => tag.startsWith('#') ? tag : `#${tag}`)
      .join(' ');
  }

  async getFileSize(filePath) {
    try {
      const stats = await fs.stat(filePath);
      return stats.size;
    } catch (error) {
      logger.error('Error getting file size:', error);
      return 0;
    }
  }

  async getVideoMetrics(publishId) {
    try {
      const response = await axios.post(
        `${this.apiUrl}/v2/video/query/`,
        {
          filters: {
            video_ids: [publishId]
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.data.data && response.data.data.videos.length > 0) {
        const video = response.data.data.videos[0];
        
        return {
          views: video.view_count || 0,
          likes: video.like_count || 0,
          shares: video.share_count || 0,
          comments: video.comment_count || 0,
          playTime: video.play_duration || 0
        };
      }
      
      return null;
      
    } catch (error) {
      logger.error('Error getting video metrics:', error);
      return null;
    }
  }

  async schedulePost(videoData, scheduledTime, postOptions = {}) {
    try {
      logger.info(`Scheduling TikTok post for ${scheduledTime}`);
      
      // In a real implementation, you would use a job queue like Bull or Agenda
      // For now, we'll use a simple setTimeout
      const delay = new Date(scheduledTime).getTime() - Date.now();
      
      if (delay <= 0) {
        // Schedule immediately
        return await this.uploadVideo(videoData, postOptions);
      }
      
      return new Promise((resolve, reject) => {
        setTimeout(async () => {
          try {
            const result = await this.uploadVideo(videoData, postOptions);
            resolve(result);
          } catch (error) {
            reject(error);
          }
        }, delay);
      });
      
    } catch (error) {
      logger.error('Error scheduling TikTok post:', error);
      throw error;
    }
  }

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const uploader = new TikTokUploader();
  
  // Example video data for testing
  const testVideoData = {
    id: 'test_video_1',
    filePath: './generated_videos/test_video.mp4',
    metadata: {
      product: 'Curso de Marketing Digital',
      platform: 'Hotmart',
      price: 297.00
    }
  };
  
  uploader.uploadVideo(testVideoData)
    .then(result => {
      console.log('Video uploaded successfully:', result);
      process.exit(0);
    })
    .catch(error => {
      console.error('Video upload failed:', error);
      process.exit(1);
    });
}

export { TikTokUploader };
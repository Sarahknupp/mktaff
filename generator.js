import ffmpeg from 'fluent-ffmpeg';
import { createCanvas, loadImage, registerFont } from 'canvas';
import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config/config.js';
import logger from '../utils/logger.js';

export class VideoGenerator {
  constructor() {
    this.outputPath = config.video.outputPath;
    this.tempPath = config.video.tempPath;
    this.ensureDirectories();
  }

  async ensureDirectories() {
    try {
      await fs.mkdir(this.outputPath, { recursive: true });
      await fs.mkdir(this.tempPath, { recursive: true });
      await fs.mkdir(path.join(this.tempPath, 'frames'), { recursive: true });
      await fs.mkdir(path.join(this.tempPath, 'audio'), { recursive: true });
    } catch (error) {
      logger.error('Error creating directories:', error);
    }
  }

  async generateVideo(product, options = {}) {
    const videoId = uuidv4();
    const outputFile = path.join(this.outputPath, `${videoId}.mp4`);
    
    try {
      logger.info(`Starting video generation for product: ${product.title}`);
      
      // Generate video frames
      const frames = await this.generateFrames(product, videoId);
      
      // Generate audio narration
      const audioFile = await this.generateAudio(product, videoId);
      
      // Combine frames and audio into video
      const videoFile = await this.combineFramesAndAudio(frames, audioFile, outputFile, options);
      
      // Generate thumbnail
      const thumbnailFile = await this.generateThumbnail(product, videoId);
      
      const videoData = {
        id: videoId,
        productId: product.id,
        filePath: videoFile,
        thumbnailPath: thumbnailFile,
        duration: options.duration || 30,
        resolution: config.video.resolution,
        status: 'ready',
        createdAt: new Date().toISOString(),
        metadata: {
          product: product.title,
          platform: product.platform,
          price: product.price
        }
      };
      
      logger.info(`Video generation completed: ${videoFile}`);
      return videoData;
      
    } catch (error) {
      logger.error(`Error generating video for product ${product.title}:`, error);
      throw error;
    }
  }

  async generateFrames(product, videoId) {
    const frames = [];
    const frameCount = 30 * (config.video.duration.min + Math.random() * (config.video.duration.max - config.video.duration.min));
    
    try {
      logger.info(`Generating ${Math.floor(frameCount)} frames for video ${videoId}`);
      
      for (let i = 0; i < frameCount; i++) {
        const frameFile = path.join(this.tempPath, 'frames', `${videoId}_frame_${i.toString().padStart(4, '0')}.png`);
        
        await this.createFrame(product, i, frameCount, frameFile);
        frames.push(frameFile);
        
        if (i % 30 === 0) {
          logger.info(`Generated ${i}/${Math.floor(frameCount)} frames`);
        }
      }
      
      logger.info(`Frame generation completed for video ${videoId}`);
      return frames;
      
    } catch (error) {
      logger.error(`Error generating frames for video ${videoId}:`, error);
      throw error;
    }
  }

  async createFrame(product, frameIndex, totalFrames, outputFile) {
    const canvas = createCanvas(1080, 1920); // 9:16 aspect ratio
    const ctx = canvas.getContext('2d');
    
    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, 1920);
    gradient.addColorStop(0, '#667eea');
    gradient.addColorStop(1, '#764ba2');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1080, 1920);
    
    // Animation progress
    const progress = frameIndex / totalFrames;
    
    // Title animation
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    
    const titleY = 300 + Math.sin(progress * Math.PI * 2) * 20;
    this.wrapText(ctx, product.title, 540, titleY, 900, 60);
    
    // Price highlight
    ctx.fillStyle = '#ffff00';
    ctx.font = 'bold 72px Arial';
    const priceY = 600 + Math.cos(progress * Math.PI * 2) * 15;
    ctx.fillText(`R$ ${product.price.toFixed(2)}`, 540, priceY);
    
    // Platform badge
    ctx.fillStyle = this.getPlatformColor(product.platform);
    ctx.fillRect(40, 100, 200, 60);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px Arial';
    ctx.fillText(product.platform, 140, 140);
    
    // Call to action (appears in last third of video)
    if (progress > 0.66) {
      const ctaAlpha = (progress - 0.66) / 0.34;
      ctx.globalAlpha = ctaAlpha;
      
      ctx.fillStyle = '#ff4444';
      ctx.fillRect(140, 1400, 800, 120);
      
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 36px Arial';
      ctx.fillText('CLIQUE NO LINK!', 540, 1470);
      
      ctx.globalAlpha = 1;
    }
    
    // Progress bar
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(40, 1800, 1000 * progress, 10);
    
    // Save frame
    const buffer = canvas.toBuffer('image/png');
    await fs.writeFile(outputFile, buffer);
  }

  wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    const words = text.split(' ');
    let line = '';
    let currentY = y;
    
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      
      if (testWidth > maxWidth && n > 0) {
        ctx.fillText(line, x, currentY);
        line = words[n] + ' ';
        currentY += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, x, currentY);
  }

  getPlatformColor(platform) {
    const colors = {
      'Hotmart': '#ff6b35',
      'Eduzz': '#4285f4',
      'KiwiPay': '#9c27b0'
    };
    return colors[platform] || '#666666';
  }

  async generateAudio(product, videoId) {
    const audioFile = path.join(this.tempPath, 'audio', `${videoId}_narration.mp3`);
    
    try {
      // Generate narration script
      const script = this.generateNarrationScript(product);
      
      // In a real implementation, you would use a TTS service like ElevenLabs or Google TTS
      // For now, we'll create a placeholder audio file
      logger.info(`Generating audio narration for video ${videoId}`);
      
      // Create a silent audio file as placeholder
      await new Promise((resolve, reject) => {
        ffmpeg()
          .input('anullsrc=channel_layout=stereo:sample_rate=44100')
          .inputFormat('lavfi')
          .duration(30)
          .audioCodec('mp3')
          .output(audioFile)
          .on('end', resolve)
          .on('error', reject)
          .run();
      });
      
      logger.info(`Audio generation completed for video ${videoId}`);
      return audioFile;
      
    } catch (error) {
      logger.error(`Error generating audio for video ${videoId}:`, error);
      throw error;
    }
  }

  generateNarrationScript(product) {
    const scripts = [
      `Descubra ${product.title}! Por apenas R$ ${product.price.toFixed(2)}, você pode transformar sua vida. Não perca essa oportunidade única!`,
      `${product.title} está com desconto especial! De R$ ${(product.price * 1.5).toFixed(2)} por apenas R$ ${product.price.toFixed(2)}. Clique no link agora!`,
      `Você está procurando ${product.title}? Esta é sua chance de conseguir por um preço incrível: R$ ${product.price.toFixed(2)}. Acesse já!`
    ];
    
    return scripts[Math.floor(Math.random() * scripts.length)];
  }

  async combineFramesAndAudio(frames, audioFile, outputFile, options = {}) {
    try {
      logger.info(`Combining frames and audio into video: ${outputFile}`);
      
      const framerate = options.framerate || config.video.framerate;
      const firstFrame = frames[0];
      
      await new Promise((resolve, reject) => {
        const framePattern = firstFrame.replace(/\d{4}\.png$/, '%04d.png');
        
        ffmpeg()
          .input(framePattern)
          .inputFPS(framerate)
          .input(audioFile)
          .videoCodec('libx264')
          .audioCodec('aac')
          .size(config.video.resolution)
          .aspect('9:16')
          .outputOptions([
            '-pix_fmt yuv420p',
            '-preset fast',
            '-crf 23',
            '-movflags +faststart'
          ])
          .output(outputFile)
          .on('progress', (progress) => {
            if (progress.percent) {
              logger.info(`Video encoding progress: ${Math.round(progress.percent)}%`);
            }
          })
          .on('end', () => {
            logger.info(`Video encoding completed: ${outputFile}`);
            resolve(outputFile);
          })
          .on('error', (error) => {
            logger.error('Video encoding error:', error);
            reject(error);
          })
          .run();
      });
      
      // Clean up temporary files
      await this.cleanupTempFiles(frames, audioFile);
      
      return outputFile;
      
    } catch (error) {
      logger.error('Error combining frames and audio:', error);
      throw error;
    }
  }

  async generateThumbnail(product, videoId) {
    const thumbnailFile = path.join(this.outputPath, `${videoId}_thumbnail.jpg`);
    
    try {
      const canvas = createCanvas(1080, 1920);
      const ctx = canvas.getContext('2d');
      
      // Background
      const gradient = ctx.createLinearGradient(0, 0, 0, 1920);
      gradient.addColorStop(0, '#667eea');
      gradient.addColorStop(1, '#764ba2');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 1080, 1920);
      
      // Title
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 48px Arial';
      ctx.textAlign = 'center';
      this.wrapText(ctx, product.title, 540, 300, 900, 60);
      
      // Price
      ctx.fillStyle = '#ffff00';
      ctx.font = 'bold 72px Arial';
      ctx.fillText(`R$ ${product.price.toFixed(2)}`, 540, 600);
      
      // Platform
      ctx.fillStyle = this.getPlatformColor(product.platform);
      ctx.fillRect(40, 100, 200, 60);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 24px Arial';
      ctx.fillText(product.platform, 140, 140);
      
      // Play button
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.beginPath();
      ctx.arc(540, 960, 80, 0, 2 * Math.PI);
      ctx.fill();
      
      ctx.fillStyle = '#333333';
      ctx.beginPath();
      ctx.moveTo(520, 930);
      ctx.lineTo(520, 990);
      ctx.lineTo(570, 960);
      ctx.closePath();
      ctx.fill();
      
      const buffer = canvas.toBuffer('image/jpeg', { quality: 0.9 });
      await fs.writeFile(thumbnailFile, buffer);
      
      logger.info(`Thumbnail generated: ${thumbnailFile}`);
      return thumbnailFile;
      
    } catch (error) {
      logger.error('Error generating thumbnail:', error);
      throw error;
    }
  }

  async cleanupTempFiles(frames, audioFile) {
    try {
      // Delete frame files
      for (const frame of frames) {
        try {
          await fs.unlink(frame);
        } catch (error) {
          logger.warn(`Could not delete frame file ${frame}:`, error);
        }
      }
      
      // Delete audio file
      try {
        await fs.unlink(audioFile);
      } catch (error) {
        logger.warn(`Could not delete audio file ${audioFile}:`, error);
      }
      
      logger.info('Temporary files cleaned up');
      
    } catch (error) {
      logger.error('Error cleaning up temporary files:', error);
    }
  }

  async getVideoList() {
    try {
      const files = await fs.readdir(this.outputPath);
      const videoFiles = files.filter(file => file.endsWith('.mp4'));
      
      const videos = [];
      for (const file of videoFiles) {
        const filePath = path.join(this.outputPath, file);
        const stats = await fs.stat(filePath);
        
        videos.push({
          id: path.parse(file).name,
          filename: file,
          path: filePath,
          size: stats.size,
          createdAt: stats.birthtime.toISOString()
        });
      }
      
      return videos.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
    } catch (error) {
      logger.error('Error getting video list:', error);
      return [];
    }
  }
}

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const generator = new VideoGenerator();
  
  // Example product for testing
  const testProduct = {
    id: 'test_product_1',
    title: 'Curso Completo de Marketing Digital',
    price: 297.00,
    platform: 'Hotmart',
    description: 'Aprenda marketing digital do zero ao avançado'
  };
  
  generator.generateVideo(testProduct)
    .then(video => {
      console.log('Video generated successfully:', video);
      process.exit(0);
    })
    .catch(error => {
      console.error('Video generation failed:', error);
      process.exit(1);
    });
}
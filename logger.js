import winston from 'winston';
import path from 'path';

// Create logs directory if it doesn't exist
const logsDir = './logs';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'affiliate-marketing-system' },
  transports: [
    // Write all logs with importance level of `error` or less to `error.log`
    new winston.transports.File({ 
      filename: path.join(logsDir, 'error.log'), 
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    // Write all logs with importance level of `info` or less to `combined.log`
    new winston.transports.File({ 
      filename: path.join(logsDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    // Separate log files for different components
    new winston.transports.File({
      filename: path.join(logsDir, 'scraper.log'),
      level: 'info',
      format: winston.format.combine(
        winston.format.label({ label: 'SCRAPER' }),
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message, label }) => {
          return `${timestamp} [${label}] ${level}: ${message}`;
        })
      )
    }),
    new winston.transports.File({
      filename: path.join(logsDir, 'video.log'),
      level: 'info',
      format: winston.format.combine(
        winston.format.label({ label: 'VIDEO' }),
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message, label }) => {
          return `${timestamp} [${label}] ${level}: ${message}`;
        })
      )
    }),
    new winston.transports.File({
      filename: path.join(logsDir, 'tiktok.log'),
      level: 'info',
      format: winston.format.combine(
        winston.format.label({ label: 'TIKTOK' }),
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message, label }) => {
          return `${timestamp} [${label}] ${level}: ${message}`;
        })
      )
    })
  ]
});

// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

export default logger;
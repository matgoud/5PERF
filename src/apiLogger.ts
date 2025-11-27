import morgan, { StreamOptions } from 'morgan';
import logger from './logger.js';
import config from './config.js';

const logFormat = config.get('api.logFormat') as string;

const stream: StreamOptions = {
  write: (log: string) => {
    logger.info(log.trim());
  },
};

const apiLogger = morgan(logFormat, {
  stream,
});

export default apiLogger;

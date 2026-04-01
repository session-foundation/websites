import { logger } from '@session/util-logger';

export default logger;

if (process.env.DEBUG) {
  logger.level = 'debug';
}

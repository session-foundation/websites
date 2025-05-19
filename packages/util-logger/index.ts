import { pino } from 'pino';

// biome-ignore lint: correctness noUnusedVariables: TODO: change this to use the json logger properly
export function constructLoggingArgs(...data: Array<any>) {
  if (data && typeof data[0] === 'object') {
    return data[0];
  }
  return [data?.join(' ')];
}

export const initLogger = () => {
  return pino({
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
      },
    },
  });
};

export const logger = initLogger();
// logger.level = 'debug';

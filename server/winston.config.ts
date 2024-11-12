import { utilities } from 'nest-winston';
import * as winston from 'winston';

const isError = winston.format((info) => {
  return info.level === 'error' ? false : info;
});

export const winstonConfig = {
  transports: [
    new winston.transports.Console({
      level: 'debug',
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.colorize(),
        utilities.format.nestLike('server', {
          prettyPrint: true,
        }),
        winston.format.printf(({ timestamp, level, message }) => {
          return `${timestamp} [${level}] [server] ${message}`;
        }),
      ),
    }),
    new winston.transports.File({
      filename: 'logs/socket-io.log',
      level: 'info',
      format: winston.format.combine(
        isError(),
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message }) => {
          return `${timestamp} [${level}] [server] ${message}`;
        }),
        /**
         json으로 저장하고 싶다면
         winston.format.json(),
         */
      ),
    }),
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message }) => {
          return `${timestamp} [${level}] [server] ${message}`;
        }),
      ),
    }),
  ],
};

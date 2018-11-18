import * as winston from 'winston';

export default winston.createLogger({
    transports: [new winston.transports.Console({
        level: 'silly',
        format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple())
    })]
});
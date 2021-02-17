import winston from "winston";

export default winston.createLogger({
  transports: [new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()),
    level: "silly",
  })],
});
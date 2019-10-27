import { createLogger, format, Logger, transports } from "winston";

let logger: Logger;
if ((process.env.NODE_ENV || "dev") === "production") {
  logger = createLogger({
    format: format.combine(format.errors({ stack: true }), format.json()),
    // TODO: use the winston Discord transport
    transports: [new transports.Console()]
  });
} else {
  logger = createLogger({
    format: format.combine(
      format.errors({ stack: true }),
      format.colorize(),
      format.simple()
    ),
    transports: [new transports.Console()]
  });
}

export default logger;

import { createLogger, format, Logger, transports } from "winston";
const { Loggly } = require("winston-loggly-bulk");

let logger: Logger;
/*if (!developMode()) {
  logger = createLogger({
    format: format.combine(format.errors({ stack: true }), format.json()),
    // TODO: use the winston Discord transport for level above error
    transports: [
      new Loggly({
        token: config("LOGGLY_TOKEN"),
        subdomain: "ctfbot",
        tags: ["ctfbot"],
        json: true
      })
    ]
  });
  } else {*/
  logger = createLogger({
    format: format.combine(
      format.errors({ stack: true }),
      format.colorize(),
      format.simple()
    ),
    transports: [new transports.Console()]
  });
  //}

export default logger;

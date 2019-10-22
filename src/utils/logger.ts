import {createLogger, format, transports} from "winston";

export default createLogger({
  format: format.combine(
    format.errors({stack: true}),
    format.json()),
  // TODO: use the winston Discord transport
  transports: [new transports.Console()],
});

import { Logger, transports } from "winston";

const logger = new Logger({
    transports: [
        new transports.Console({
            colorize: true,
        }),
    ],
});

export { logger };

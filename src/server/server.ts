import { app } from "./app";
import { logger } from "./utils/logger";

const HOST = process.env.HOST || "localhost";
const PORT = process.env.PORT || 2000;

app.listen(PORT as number, HOST, () => {
    logger.info(`Jovio is now listening on ${HOST}:${PORT}...`);
});

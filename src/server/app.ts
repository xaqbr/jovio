import * as bodyParser from "body-parser";
import * as cors from "cors";
import * as express from "express";
import * as morgan from "morgan";

import { router as ScriptRouter, runLiveScriptFromName } from "./controllers/script";

import wsExpress = require("express-ws");
import { logger } from "./utils/logger";

// Create app
const app = express();

// Attach websocket middleware
wsExpress(app);

// Third-party middleware
app.use(cors({ origin: "*" }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(morgan("dev"));

// Attach middleware
ScriptRouter.ws("/:name/live", runLiveScriptFromName);
app.use("/", ScriptRouter);

// Error-handling middleware
const errorHandler: express.ErrorRequestHandler = (err, _req, res, _next) => {
    logger.error(err);
    res.status(500).json({
        error: err,
    });
};
app.use(errorHandler);

export { app };

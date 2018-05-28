import * as bodyParser from "body-parser";
import * as cors from "cors";
import * as express from "express";
import * as morgan from "morgan";

import { router as ScriptRouter } from "./controllers/script";

// Create app
const app = express();

// Third-party middleware
app.use(cors({ origin: "*" }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(morgan("dev"));

// Attach middleware
app.use("/", ScriptRouter);

export { app };

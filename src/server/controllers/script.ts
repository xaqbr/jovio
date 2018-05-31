import { RequestHandler, Router } from "express";
import { WebsocketRequestHandler } from "express-ws";
import { readFile, writeFile } from "fs";
import { resolve } from "path";
import { promisify } from "util";

import { SCRIPTS_DIRECTORY } from "../utils/constants";
import { compileJavaClass, createJavaProcess, runJavaProcess, ScriptSchema } from "../utils/java";
import { logger } from "../utils/logger";

const writeFilePromise = promisify(writeFile);
const readFilePromise = promisify(readFile);

const router = Router();

export const getScriptFromName: RequestHandler = async (req, res, next) => {
    const { name } = req.params;
    try {
        if (!name) { throw new Error("Script not found."); }
        const code = await readFilePromise(
            resolve(SCRIPTS_DIRECTORY, `${name}.java`),
        );
        res.json({ name, code: code.toString() });
    } catch (error) {
        next(error);
    }
};
router.get("/:name", getScriptFromName);

export const createScript: RequestHandler = async (req, res, next) => {
    const { name, code } = req.body;
    try {
        await ScriptSchema.validate({ name, code });
        const filePath = resolve(SCRIPTS_DIRECTORY, `${name}.java`);
        logger.info("Creating new script...", { script: filePath });
        logger.debug("Creating script java file...", { script: filePath });
        await writeFilePromise(filePath, code);
        logger.debug("Compiling script...", { script: filePath });
        await compileJavaClass(filePath);
        res.json({ name, code });
    } catch (error) {
        next(error);
    }
};
router.post("/", createScript);

export const runStaticScriptFromName: RequestHandler = async (req, res, next) => {
    const { name } = req.params;
    try {
        const start = process.hrtime();
        const runProcess = await runJavaProcess(name);
        const elapsed = process.hrtime(start)[1] / 1000000;
        logger.info(`Running script (static): ${name}...`);
        const { stdout, stderr } = runProcess;
        logger.verbose(`Script output: ${stdout}`);
        logger.info(`Script finished: ${name}.`);
        res.json({
            output: stdout,
            errors: stderr,
            executionMs: elapsed.toFixed(2),
        });
    } catch (error) {
        next(error);
    }
};
router.get("/:name/static", runStaticScriptFromName);

export const runLiveScriptFromName: WebsocketRequestHandler = async (ws, req) => {
    const { name } = req.params;
    try {
        const runProcess = await createJavaProcess(name);
        logger.info(`Running script (live): ${name}...`);
        runProcess.stdout.on("data", (data) => {
            if (data) {
                logger.verbose(`Script output: ${data}`);
                ws.send(data.toString());
            }
        });
        runProcess.on("close", () => {
            logger.info(`Script finished: ${name}.`);
            ws.close(1000, "Program finished.");
        });
    } catch (error) {
        logger.error(error);
        ws.close(1000, `Error: ${error}`);
    }
};

export { router };

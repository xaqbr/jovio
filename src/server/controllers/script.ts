import { RequestHandler, Router } from "express";
import { WebsocketRequestHandler } from "express-ws";
import { readFile, writeFile } from "fs";
import { resolve } from "path";
import { promisify } from "util";

import { SCRIPTS_DIRECTORY } from "../utils/constants";
import { runJavaClass, ScriptSchema } from "../utils/java";

const writeFilePromise = promisify(writeFile);
const readFilePromise = promisify(readFile);

const router = Router();

export const getScriptFromName: RequestHandler = async (req, res) => {
    const { name } = req.body;
    try {
        const code = await readFilePromise(
            resolve(SCRIPTS_DIRECTORY, `${name}.java`),
        );
        res.json({ name, code });
    } catch (error) {
        res.status(500).send(error);
    }
};
router.get("/", getScriptFromName);

export const createScript: RequestHandler = async (req, res) => {
    const { name, code } = req.body;
    try {
        await ScriptSchema.validate({ name, code });
        await writeFilePromise(
            resolve(SCRIPTS_DIRECTORY, `${name}.java`),
            code,
        );
        res.json({ name, code });
    } catch (error) {
        res.status(500).send(error);
    }
};
router.post("/", createScript);

export const runScriptFromName: WebsocketRequestHandler = async (ws, req) => {
    const { name } = req.body;
    try {
        const runProcess = await runJavaClass(
            resolve(SCRIPTS_DIRECTORY, `${name}.java`),
        );
        runProcess.stdout.on("data", (data) => { ws.emit("output", data); });
        runProcess.on("close", (code, signal) => { ws.close(code, signal); });
    } catch (error) {
        ws.close(0, `Error: ${error}`);
    }
};

export { router };

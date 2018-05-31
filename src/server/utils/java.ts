import * as Joi from "joi";

import { exec, spawn } from "child_process";
import { promisify } from "util";
import { SCRIPTS_DIRECTORY } from "./constants";
import { logger } from "./logger";

const execProcessPromise = promisify(exec);

export const ScriptSchema = Joi.object().keys({
    code: Joi.string().trim().required(),
    name: Joi.string().alphanum().required(),
});

export const compileJavaClass = async (filePath: string) => {
    await execProcessPromise(`javac ${filePath}`);
};

export const createJavaProcess = async (fileName: string) => {
    logger.debug("Spawning java runtime process...");
    const runProcess = spawn(
        "java",
        [fileName],
        { cwd: SCRIPTS_DIRECTORY },
    );
    return runProcess;
};

export const runJavaProcess = async (fileName: string) => {
    logger.debug("Running java process...");
    return await execProcessPromise(`java ${fileName}`, { cwd: SCRIPTS_DIRECTORY });
};

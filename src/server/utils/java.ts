import * as Joi from "joi";

import { spawn } from "child_process";
import { resolve } from "path";

export const ScriptSchema = Joi.object().keys({
    code: Joi.string().trim().required(),
    name: Joi.string().alphanum().required(),
});

export const compileJavaClass = async (filePath: string) => {
    const compileProcess = spawn("javac", [filePath]);
    compileProcess.stderr.on("data", (data) => { throw data; });
    compileProcess.on("close", () => { return; });
};

export const runJavaClass = async (filePath: string) => {
    const runProcess = spawn(
        "java",
        ["-cp", resolve(filePath, ".."), filePath],
    );
    return runProcess;
};

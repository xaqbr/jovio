import { RequestHandler, Router } from "express";
import { writeFile } from "fs";
import { promisify } from "util";

const writeFilePromise = promisify(writeFile);

const router = Router();

const createScript: RequestHandler = async (req, res) => {
    const { name, code } = req.body;
    if (!name || !code) { res.status(400).send("Name and code fields are required."); }
    await writeFilePromise(`${name}.class`, code);
    res.send(201);
};
router.post("/", createScript);

const getScript: RequestHandler = (req, res) => {
    res.send(req.body);
};
router.get("/", getScript);

export { router };

import { RequestHandler, Router } from "express";

const router = Router();

const getScript: RequestHandler = (req, res) => {
    res.send(req.body);
};
router.post("/", getScript);

export { router };

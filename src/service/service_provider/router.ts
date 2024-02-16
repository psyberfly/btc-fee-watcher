import { Router } from "express";
import { handleGetIndex } from "./dto";
export const router = Router();

export const alertStreamPath = "index";

router.get("/index", handleGetIndex);

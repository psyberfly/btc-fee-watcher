import { Router } from "express";
import { handleGetIndex } from "./dto";
export const router = Router();

export const alertStreamPath = "/streamFeeRatio";

router.get("/index", handleGetIndex);

import { Router } from "express";
import { handleGetFeeRatio } from "./dto";
export const router = Router();

export const alertStreamPath = "/streamFeeRatio";

router.get("/feeRatio", handleGetFeeRatio);

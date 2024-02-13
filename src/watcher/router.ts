import { Router } from "express";
import { handleGetFeeRatio } from "./dto";

export const router = Router();

router.get("/feeRatio", handleGetFeeRatio);



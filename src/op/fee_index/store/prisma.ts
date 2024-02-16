import { FeeEstimate, FeeIndex, MovingAverage } from "@prisma/client";
import { handleError } from "../../../lib/errors/e";
import { prisma } from "../../../main";
import { IndexResponse } from "../interface";

export class FeeIndexPrismaStore {
  async fetchLatest(): Promise<IndexResponse | Error> {
    try {
      const latest = await prisma.feeIndex.findFirst({
        orderBy: { createdAt: "desc" },
        include: {
          feeEstimate: true,
          movingAverage: true,
        },
      });

      const latestIndexRes: IndexResponse = {
        timestamp: latest.createdAt,
        feeEstimateMovingAverageRatio: {
          last365Days: latest.ratioLast365Days.toNumber(),
          last30Days: latest.ratioLast30Days.toNumber(),
        },
        currentFeeEstimate: {
          satsPerByte: latest.feeEstimate.satsPerByte.toNumber(),
        },
        movingAverage: {
          last365Days: latest.movingAverage.last365Days.toNumber(),
          last30Days: latest.movingAverage.last30Days.toNumber(),
        },
      };

      return latestIndexRes;
    } catch (error) {
      return handleError(error);
    }
  }

  async insert(index: FeeIndex): Promise<boolean | Error> {
    try {
      await prisma.feeIndex.create({
        data: {
          feeEstimateId: index.feeEstimateId,
          movingAverageId: index.movingAverageId,
          ratioLast365Days: index.ratioLast365Days,
          ratioLast30Days: index.ratioLast30Days,
        },
      });

      return true;
    } catch (error) {
      return handleError(error);
    }
  }
}

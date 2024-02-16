import { FeeIndex } from "@prisma/client";
import { handleError } from "../../../lib/errors/e";
import { prisma } from "../../../main";

export class FeeIndexPrismaStore {
  async readLatest(): Promise<FeeIndex | Error> {
    try {
      const latestIndex = await prisma.feeIndex.findFirst({
        orderBy: { createdAt: "desc" },
        include: {
          feeEstimate: true,
          movingAverage: true,
        },
      });

      return latestIndex;
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

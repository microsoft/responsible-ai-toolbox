import { ClassificationEnum } from "./JointDataset";

export interface IBinaryStats {
    accuracy: number;
    precision: number;
    recall: number;
    falsePositiveRate: number;
    falseNegativeRate: number;
}

export const generateBinaryStats: (outcomes: number[]) => IBinaryStats = (outcomes: number[]): IBinaryStats => {
    const falseNegCount = outcomes.filter(x => x === ClassificationEnum.FalseNegative).length;
    const falsePosCount = outcomes.filter(x => x === ClassificationEnum.FalsePositive).length;
    const trueNegCount = outcomes.filter(x => x === ClassificationEnum.TrueNegative).length;
    const truePosCount = outcomes.filter(x => x === ClassificationEnum.TruePositive).length;
    const total = outcomes.length;
    return {
        accuracy: (truePosCount + trueNegCount) / total,
        precision: truePosCount / (truePosCount + trueNegCount),
        recall: truePosCount / (truePosCount + falseNegCount),
        falsePositiveRate: falsePosCount / (trueNegCount + falsePosCount),
        falseNegativeRate: falseNegCount / (truePosCount + falseNegCount)
    }
}
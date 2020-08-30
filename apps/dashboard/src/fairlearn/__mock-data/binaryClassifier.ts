import { IFairnessProps } from "@responsible-ai/fairlearn";

export const binaryClassifier: Omit<
  IFairnessProps,
  | "supportedBinaryClassificationAccuracyKeys"
  | "supportedRegressionAccuracyKeys"
  | "supportedProbabilityAccuracyKeys"
> = {
  trueY: [1, 0, 1, 1, 0, 1, 0, 0],
  predictedY: [
    [1, 0, 0, 1, 1, 1, 1, 0],
    [1, 1, 1, 1, 1, 1, 1, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ],
  testData: [
    ["a", "1", "test1", 1],
    ["b", "2", "test2", 2],
    ["b", "2", "test3", 3],
    ["babaganoush test long", "3", "test4", 1],
    ["b", "2", "test5", 2],
    ["b", "2", "test6", 3],
    ["b", "2", "test7", 0],
    ["b", "2", "test8", 3]
  ]
};

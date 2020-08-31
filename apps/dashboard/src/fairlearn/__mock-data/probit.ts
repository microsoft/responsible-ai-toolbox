import { IFairnessDataProps } from "@responsible-ai/fairlearn";

export const probit: IFairnessDataProps = {
  trueY: [1, 1, 1, 1, 0, 0, 0, 0],
  predictedY: [
    [0.9, 0.92, 0.47, 0.22, 0.01, 0.05, 0.1, 0.2],
    [0.9, 0.92, 0.47, 0.22, 0.01, 0.05, 0.1, 0.2],
    [0.9, 0.92, 0.47, 0.22, 0.01, 0.05, 0.1, 0.2]
  ],
  testData: [
    ["a", "1"],
    ["b", "2"],
    ["b", "2"],
    ["b", "3"],
    ["a", "1"],
    ["b", "2"],
    ["b", "2"],
    ["b", "3"]
  ]
};

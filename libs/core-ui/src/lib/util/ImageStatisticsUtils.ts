// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export enum ImageClassificationMetrics {
  Accuracy = "accuracy",
  MacroF1 = "f1",
  MacroPrecision = "precision",
  MacroRecall = "recall",
  MicroF1 = "microF1",
  MicroPrecision = "microPrecision",
  MicroRecall = "microRecall"
}

interface IMicroMacroRetVal {
  macroScore: number;
  microScore: number;
}

export const generateMicroMacroMetrics = (
  main: number[],
  secondary: number[]
): IMicroMacroRetVal => {
  const mainLabels = new Set();
  main.forEach((val: number) => {
    if (!mainLabels.has(val)) {
      mainLabels.add(val);
    }
  });
  let truePositivesSum = 0;
  let totalPositivesSum = 0;
  const macroScores: number[] = [];
  mainLabels.forEach((label) => {
    let truePositives = 0;
    let totalPositives = 0;
    main.forEach((val, index) => {
      if (val === label) {
        totalPositives += 1;
        totalPositivesSum += 1;
        if (secondary[index] === label) {
          truePositives += 1;
          truePositivesSum += 1;
        }
      }
    });
    const score = truePositives / totalPositives;
    macroScores.push(score);
  });
  const macroScore =
    macroScores.reduce((total, curr) => {
      return total + curr;
    }, 0) / macroScores.length;

  const microScore = truePositivesSum / totalPositivesSum;
  return {
    macroScore,
    microScore
  };
};

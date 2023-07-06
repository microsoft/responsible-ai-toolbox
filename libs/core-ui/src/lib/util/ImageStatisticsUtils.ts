// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { localization } from "@responsible-ai/localization";

import {
  ILabeledStatistic,
  TotalCohortSamples
} from "../Interfaces/IStatistic";

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

export const generateImageStats: (
  trueYs: number[],
  predYs: number[]
) => ILabeledStatistic[] = (
  trueYs: number[],
  predYs: number[]
): ILabeledStatistic[] => {
  const correctCount = predYs.filter(
    (pred, index) => pred === trueYs[index]
  ).length;
  const accuracy = correctCount / predYs.length;
  const precision = generateMicroMacroMetrics(predYs, trueYs);
  const microP = precision.microScore;
  const macroP = precision.macroScore;
  const recall = generateMicroMacroMetrics(trueYs, predYs);
  const microR = recall.microScore;
  const macroR = recall.macroScore;
  const microF1 = 2 * ((microP * microR) / (microP + microR)) || 0;
  const macroF1 = 2 * ((macroP * macroR) / (macroP + macroR)) || 0;
  return [
    {
      key: TotalCohortSamples,
      label: localization.Interpret.Statistics.samples,
      stat: predYs.length
    },
    {
      key: ImageClassificationMetrics.Accuracy,
      label: localization.Interpret.Statistics.accuracy,
      stat: accuracy
    },
    {
      key: ImageClassificationMetrics.MicroPrecision,
      label: localization.Interpret.Statistics.precision,
      stat: microP
    },
    {
      key: ImageClassificationMetrics.MicroRecall,
      label: localization.Interpret.Statistics.recall,
      stat: microR
    },
    {
      key: ImageClassificationMetrics.MicroF1,
      label: localization.Interpret.Statistics.f1Score,
      stat: microF1
    },
    {
      key: ImageClassificationMetrics.MacroPrecision,
      label: localization.Interpret.Statistics.precision,
      stat: macroP
    },
    {
      key: ImageClassificationMetrics.MacroRecall,
      label: localization.Interpret.Statistics.recall,
      stat: macroR
    },
    {
      key: ImageClassificationMetrics.MacroF1,
      label: localization.Interpret.Statistics.f1Score,
      stat: macroF1
    }
  ];
};

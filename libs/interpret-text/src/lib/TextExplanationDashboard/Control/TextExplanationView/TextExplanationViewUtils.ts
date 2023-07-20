// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { WeightVectorOption, WeightVectors } from "@responsible-ai/core-ui";

import { QAExplanationType, Utils } from "../../CommonUtils";

import { MaxImportantWords } from "./ITextExplanationViewSpec";

export function getOutputFeatureImportances(
  localExplanations: number[][],
  baseValues?: number[][]
): number[][] {
  const startSumOfFeatureImportances = localExplanations[0].map((_, index) =>
    localExplanations[0].reduce((sum, row) => sum + row[index], 0)
  );
  const startOutputFeatureImportances = baseValues?.[0].map(
    (bValue, index) => startSumOfFeatureImportances[index] + bValue
  );
  const endSumOfFeatureImportances = localExplanations[1].map((_, index) =>
    localExplanations[1].reduce((sum, row) => sum + row[index], 0)
  );
  const endOutputFeatureImportances = baseValues?.[1].map(
    (bValue, index) => endSumOfFeatureImportances[index] + bValue
  );
  return [
    startOutputFeatureImportances || [],
    endOutputFeatureImportances || []
  ];
}

export function calculateTopKImportances(importances: number[]): number {
  return Math.min(
    MaxImportantWords,
    Math.ceil(Utils.countNonzeros(importances) / 2)
  );
}

export function calculateMaxKImportances(importances: number[]): number {
  return Math.min(
    MaxImportantWords,
    Math.ceil(Utils.countNonzeros(importances))
  );
}

export function computeImportancesForWeightVector(
  importances: number[][],
  weightVector: WeightVectorOption
): number[] {
  if (weightVector === WeightVectors.AbsAvg) {
    // Sum the multidimensional array to one dimension across rows for each token
    const numClasses = importances[0].length;
    const sumImportances = importances.map((row) =>
      row.reduce((a, b): number => {
        return (a + Math.abs(b)) / numClasses;
      }, 0)
    );
    return sumImportances;
  }
  return importances.map(
    (perClassImportances) => perClassImportances[weightVector as number]
  );
}

export function computeImportancesForAllTokens(
  importances: number[][],
  isInitialState?: boolean,
  qaRadio?: string
): number[] {
  const startSumImportances = importances[0].map((_, index) =>
    importances.reduce((sum, row) => sum + row[index], 0)
  );
  const endSumImportances = importances[1].map((_, index) =>
    importances.reduce((sum, row) => sum + row[index], 0)
  );
  if (isInitialState) {
    return startSumImportances;
  }

  return qaRadio === QAExplanationType.Start
    ? startSumImportances
    : endSumImportances;
}

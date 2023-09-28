// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { WeightVectorOption, WeightVectors } from "@responsible-ai/core-ui";

import { QAExplanationType, Utils } from "../../CommonUtils";

import { MaxImportantWords } from "./ITextExplanationViewSpec";

export function getOutputFeatureImportances(
  localExplanations: number[][][],
  baseValues?: number[][]
): number[][] {
  const startSumOfFeatureImportances = getSumOfFeatureImportances(
    localExplanations[0]
  );
  const endSumOfFeatureImportances = getSumOfFeatureImportances(
    localExplanations[1]
  );
  const startOutputFeatureImportances = getOutputFeatureImportancesIntl(
    startSumOfFeatureImportances,
    baseValues?.[0]
  );
  const endOutputFeatureImportances = getOutputFeatureImportancesIntl(
    endSumOfFeatureImportances,
    baseValues?.[1]
  );
  return [
    startOutputFeatureImportances || [],
    endOutputFeatureImportances || []
  ];
}

export function getSumOfFeatureImportances(importances: number[][]): number[] {
  return importances.map((_, index) =>
    importances.reduce((sum, row) => sum + row[index], 0)
  );
}

export function getOutputFeatureImportancesIntl(
  sumOfFeatureImportances: number[],
  baseValues?: number[]
): number[] | undefined {
  return baseValues?.map(
    (bValue, index) => sumOfFeatureImportances[index] + bValue
  );
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
  importances: number[][][],
  isInitialState?: boolean,
  qaRadio?: string
): number[] {
  const startImportances = importances[0];
  const startSumImportances = startImportances.map((_, index) =>
    startImportances.reduce((sum, row) => sum + row[index], 0)
  );
  const endImportances = importances[1];
  const endSumImportances = endImportances.map((_, index) =>
    endImportances.reduce((sum, row) => sum + row[index], 0)
  );
  if (isInitialState) {
    return startSumImportances;
  }

  return qaRadio === QAExplanationType.Start
    ? startSumImportances
    : endSumImportances;
}

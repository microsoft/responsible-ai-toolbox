// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IConfusionMatrixData } from "../Interfaces/IConfusionMatrixData";

export function calculateConfusionMatrixData(
  yTrue: number[],
  yPred: number[],
  allLabels: string[],
  selectedLabels?: string[]
): IConfusionMatrixData | undefined {
  if (
    yTrue.length !== yPred.length ||
    !yTrue.concat(yPred).every((el) => el < allLabels.length)
  ) {
    return undefined;
  }

  const selectedLabelSet = new Set<string>(
    selectedLabels !== undefined ? selectedLabels : allLabels
  );

  const labelMap = new Map<number, number>();

  // Inspired from sklearn
  // https://github.com/scikit-learn/scikit-learn/blob/8694eb00f8a3c0dede331fe60c0415bfaafef631/sklearn/metrics/_classification.py#L335
  let idx = 0;
  allLabels.forEach((element, index) => {
    if (selectedLabelSet.has(element)) {
      labelMap.set(index, idx);
      idx += 1;
    }
  });

  const cm: number[][] = new Array(labelMap.size)
    .fill(0)
    .map(() => new Array(labelMap.size).fill(0));

  yTrue.forEach((element, index) => {
    const trueIdx = labelMap.get(element);
    const predIdx = labelMap.get(yPred[index]);
    if (trueIdx !== undefined && predIdx !== undefined) {
      cm[trueIdx][predIdx] += 1;
    }
  });

  return {
    confusionMatrix: cm,
    selectedLabels: [...labelMap.keys()].map((idx) => allLabels[idx])
  };
}

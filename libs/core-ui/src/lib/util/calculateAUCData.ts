// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IAUCData } from "../Interfaces/IAUCData";

export function calculateAUCData(
  yTrue: number[],
  yPred: number[],
  allLabels: string[]
): IAUCData | undefined {
  if (
    yTrue.length !== yPred.length ||
    !yTrue.concat(yPred).every((el) => el < allLabels.length)
  ) {
    return undefined;
  }
  // false positive rate is x
  // true positive rate is y
  // https://github.com/scikit-learn/scikit-learn/blob/2a2772a87b6c772dc3b8292bcffb990ce27515a8/sklearn/metrics/_ranking.py#L50

  // use ROC to get fpr and tpr
  // https://github.com/scikit-learn/scikit-learn/blob/2a2772a87b6c772dc3b8292bcffb990ce27515a8/sklearn/metrics/_ranking.py#L933

  // const selectedLabelSet = new Set<string>(
  //   selectedLabels !== undefined ? selectedLabels : allLabels
  // );

  const labelMap = new Map<number, number>();

  // Inspired from sklearn
  // https://github.com/scikit-learn/scikit-learn/blob/8694eb00f8a3c0dede331fe60c0415bfaafef631/sklearn/metrics/_classification.py#L335
  // let idx = 0;
  // allLabels.forEach((element, index) => {
  //   if (selectedLabelSet.has(element)) {
  //     labelMap.set(index, idx);
  //     idx += 1;
  //   }
  // });

  const data: number[][] = new Array(labelMap.size)
    .fill(0)
    .map(() => new Array(labelMap.size).fill(0));

  yTrue.forEach((element, index) => {
    const trueIdx = labelMap.get(element);
    const predIdx = labelMap.get(yPred[index]);
    if (trueIdx !== undefined && predIdx !== undefined) {
      data[trueIdx][predIdx] += 1;
    }
  });

  return {
    AUCData: data,
    selectedLabels: [...labelMap.keys()].map((idx) => allLabels[idx])
  };
}

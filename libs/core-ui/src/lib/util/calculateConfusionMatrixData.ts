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

  let idx = 0;

  allLabels.forEach((element, index) => {
    if (selectedLabelSet.has(element)) {
      labelMap.set(index, idx);
      idx += 1;
    }
  });

  const confusionMatrixSize = labelMap.size;

  const cm: number[][] = new Array(confusionMatrixSize)
    .fill(0)
    .map(() => new Array(confusionMatrixSize).fill(0));

  yTrue.forEach((element, index) => {
    const trueIdx = labelMap.get(element);
    const predIdx = labelMap.get(yPred[index]);
    if (trueIdx !== undefined && predIdx !== undefined) {
      cm[trueIdx][predIdx] += 1;
    }
  });
  return {
    confusionMatrix: cm,
    labels: allLabels,
    selectedLabels: selectedLabels !== undefined ? selectedLabels : allLabels
  };
}

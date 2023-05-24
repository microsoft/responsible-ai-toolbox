// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IsClassifier,
  ModelExplanationUtils,
  ModelTypes,
  WeightVectorOption
} from "@responsible-ai/core-ui";

import { regressionKeyValue } from "./constants";
export interface ILocalImportanceData {
  label: string;
  value: number;
}

export function getSortedData(
  selectedWeightVector: WeightVectorOption,
  modelType: ModelTypes,
  sortedData: Array<{ [key: string]: number[] | number | undefined }>,
  sortAbsolute: boolean,
  unSortedX?: string[],
  rowNumber?: number
): ILocalImportanceData[] {
  const localExplanationsData: ILocalImportanceData[] = [];
  if (rowNumber === undefined) {
    return localExplanationsData;
  }
  const keyToFind = IsClassifier(modelType)
    ? (selectedWeightVector as string)
    : regressionKeyValue;
  const localData = findValue(sortedData, keyToFind);

  if (!localData) {
    return localExplanationsData;
  }

  const sortedLocalExplanationsIndices = sortAbsolute
    ? ModelExplanationUtils.getAbsoluteSortIndices(localData).reverse()
    : ModelExplanationUtils.getSortIndices(localData).reverse();
  const sortedLocalExplanationsData = sortedLocalExplanationsIndices.map(
    (index) => localData[index]
  );
  const sortedX = unSortedX
    ? sortedLocalExplanationsIndices.map((i) => unSortedX[i])
    : [];
  sortedX.forEach((x: string, index: string | number) => {
    localExplanationsData.push({
      label: x,
      value: sortedLocalExplanationsData[index] || -Infinity
    });
  });
  return localExplanationsData;
}

function findValue(sortedData: any, keyToFind: string): number[] | undefined {
  const sortedDataTemp: Array<{ [key: string]: number[] }> = sortedData;
  let valToReturn: number[] | undefined;
  for (const data of sortedDataTemp) {
    const entry = data
      ? Object.entries(data).find((pair) => pair[0] === keyToFind.toString())
      : undefined;
    if (entry) {
      valToReturn = entry[1]; // value of the entry
      break;
    }
  }
  return valToReturn;
}

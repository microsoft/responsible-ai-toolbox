// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { localization } from "@responsible-ai/localization";
import { SeriesOptionsType } from "highcharts";
import { orderBy, sortBy, sum, unzip, zipWith } from "lodash";

import { IDataset } from "../Interfaces/IDataset";

export interface IROCData {
  falsePositiveRates: number[];
  truePositiveRates: number[];
}

function getStaticROCData(): SeriesOptionsType[] {
  return [
    {
      data: [
        { x: 0, y: 0 },
        { x: 0, y: 1 },
        { x: 1, y: 1 }
      ],
      name: localization.Interpret.Charts.Ideal,
      type: "line"
    },
    {
      data: [
        { x: 0, y: 0 },
        { x: 1, y: 1 }
      ],
      name: localization.Interpret.Charts.Random,
      type: "line"
    }
  ];
}

function calculatePerClassROCData(
  probabilityY: number[],
  binTrueY: boolean[]
): IROCData {
  const rocData: IROCData = {
    falsePositiveRates: [],
    truePositiveRates: []
  };

  const yData = zipWith(probabilityY, binTrueY, (probY, trueY) => {
    return {
      probabilityY: probY,
      trueY
    };
  });
  const sortedY = sortBy(yData, ["probabilityY"]);
  let prevProba = -Infinity;
  let truePositives = 0;
  let falsePositives = 0;
  const totalPositives = sum(binTrueY);
  const totalNegatives = binTrueY.length - totalPositives;
  let i = sortedY.length - 1;
  while (i >= 0) {
    // only add the point, if the probability has changed
    if (sortedY[i].probabilityY !== prevProba) {
      addROCPoint(
        truePositives,
        falsePositives,
        totalPositives,
        totalNegatives,
        rocData
      );
      prevProba = sortedY[i].probabilityY;
    }
    const threshold = sortedY[i].probabilityY;
    truePositives = 0;
    falsePositives = 0;
    for (const y of sortedY) {
      // if the probability of predicting the positive label is greater than the
      // threshold and the positive label was predicted than it's a true positive.
      // otherwise, it's a false positive
      if (y.probabilityY >= threshold) {
        if (y.trueY) {
          truePositives++;
        } else {
          falsePositives++;
        }
      }
    }
    i--;
  }
  addROCPoint(
    truePositives,
    falsePositives,
    totalPositives,
    totalNegatives,
    rocData
  );

  return rocData;
}

function addROCPoint(
  truePositives: number,
  falsePositives: number,
  totalPositives: number,
  totalNegatives: number,
  rocData: IROCData
): void {
  // prevent division by 0
  const tpr = totalPositives === 0 ? 1 : truePositives / totalPositives;
  const fpr = totalNegatives === 0 ? 1 : falsePositives / totalNegatives;
  rocData.truePositiveRates.push(tpr);
  rocData.falsePositiveRates.push(fpr);
}

export function binarizeData(
  yData: string[] | number[] | number[][],
  classes: string[] | number[]
): boolean[][] {
  // binarize labels in a one-vs-all fashion according to
  const yBinData: boolean[][] = [];

  for (const yDatum of yData) {
    const binaryData = classes.map((c) => {
      return c === yDatum;
    });
    yBinData.push(binaryData);
  }
  // transpose
  return unzip(yBinData);
}

// based on https://msdata.visualstudio.com/Vienna/_git/AzureMlCli?path=/src/azureml-metrics/azureml/metrics/_classification.py&version=GBmaster
export function calculateAUCData(dataset: IDataset): SeriesOptionsType[] {
  if (!dataset.probability_y || !dataset.class_names) {
    // TODO: show warning message
    return [...getStaticROCData()];
  }

  const binTrueY = binarizeData(dataset.true_y, dataset.class_names);
  const data = [];
  // TODO: class_names.length might not work ....
  for (let i = 0; i < dataset.class_names.length; i++) {
    const classROCData = calculatePerClassROCData(
      dataset.probability_y[i],
      binTrueY[i]
    );
    const classData = zipWith(
      classROCData.falsePositiveRates,
      classROCData.truePositiveRates,
      (fpr, tpr) => {
        return {
          // TODO: check class_names length earlier ?
          name: dataset.class_names ? dataset.class_names[i] : "",
          x: fpr,
          y: tpr
        };
      }
    );
    data.push(classData);
  }

  const allData = [
    {
      data: orderBy(data, ["x"]),
      name: "AUC",
      type: "line"
    },
    ...getStaticROCData()
  ];
  return allData as SeriesOptionsType[];
}

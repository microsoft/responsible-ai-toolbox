// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { localization } from "@responsible-ai/localization";
import { SeriesOptionsType } from "highcharts";
import { range, unzip } from "lodash";

import { IDataset } from "../Interfaces/IDataset";

interface IPoint {
  x: number;
  y: number;
}
export interface IROCData {
  points: IPoint[];
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

export function calculatePerClassROCData(
  probabilityY: number[],
  binY: number[]
): IROCData {
  const rocData: IROCData = {
    points: []
  };
  const thresholds = range(0, 1, 0.01);
  let truePositives = 0;
  let falsePositives = 0;
  let trueNegatives = 0;
  let falseNegatives = 0;

  for (const threshold of thresholds) {
    for (const [index, yProba] of probabilityY.entries()) {
      // if the probability of predicting the positive label is greater than the
      // threshold then it's a true positive.
      // otherwise, it's a false positive
      if (yProba < threshold) {
        if (binY[index]) {
          falseNegatives++;
        } else {
          trueNegatives++;
        }
      } else if (binY[index]) {
        truePositives++;
      } else {
        falsePositives++;
      }
    }
    addROCPoint(
      truePositives,
      falsePositives,
      trueNegatives,
      falseNegatives,
      rocData
    );
    truePositives = falsePositives = trueNegatives = falseNegatives = 0;
  }

  return rocData;
}

function addROCPoint(
  truePositives: number,
  falsePositives: number,
  trueNegatives: number,
  falseNegatives: number,
  rocData: IROCData
): void {
  // prevent division by 0
  const totalNegatives = trueNegatives + falsePositives;
  const totalPositives = truePositives + falseNegatives;
  const tpr = totalPositives === 0 ? 1 : truePositives / totalPositives;
  const fpr = totalNegatives === 0 ? 1 : falsePositives / totalNegatives;
  rocData.points.push({ x: fpr, y: tpr });
}

export function binarizeData(
  yData: string[] | number[] | number[][],
  classes: string[] | number[]
): number[][] {
  // binarize labels in a one-vs-all fashion according to
  const yBinData: number[][] = [];
  for (const yDatum of yData) {
    const binaryData = classes.map((c) => {
      return c === yDatum ? 1 : 0;
    });
    yBinData.push(binaryData);
  }
  return yBinData;
}

// based on https://msdata.visualstudio.com/Vienna/_git/AzureMlCli?path=/src/azureml-metrics/azureml/metrics/_classification.py&version=GBmaster
export function calculateAUCData(dataset: IDataset): SeriesOptionsType[] {
  if (!dataset.probability_y || !dataset.class_names) {
    // TODO: show warning message
    return [...getStaticROCData()];
  }

  // temporary, replace with dataset.classnames
  const cNames = [0, 1];
  const binTrueY = binarizeData(dataset.true_y, cNames);
  console.log(binTrueY);
  // transpose in order to group class data together
  const perClassBinY = unzip(binTrueY);
  const perClassProba = unzip(dataset.probability_y);
  const data = [];
  // loop through each class to calculate roc data per class
  for (const [i, element] of perClassBinY.entries()) {
    const classROCData = calculatePerClassROCData(perClassProba[i], element);
    const classData = {
      data: classROCData.points,
      // TODO: check class_names length earlier ?
      name: cNames ? cNames[i] : "",
      type: "line"
    };
    data.push(classData);
  }

  const allData = [...data, ...getStaticROCData()];
  return allData as SeriesOptionsType[];
}

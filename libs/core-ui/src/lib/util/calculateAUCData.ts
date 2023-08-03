// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { localization } from "@responsible-ai/localization";
import { SeriesOptionsType } from "highcharts";
import { orderBy, sum, unzip, zipWith } from "lodash";

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

export function getConvexHullPoints(points: IPoint[]): IPoint[] {
  // construct the convex hull of the ROC points
  const sortedPoints = orderBy(points, ["x", "y"], ["asc", "desc"]);
  const convexHullPoints = [];
  let highestY = -Infinity;
  for (let i = 0; i < sortedPoints.length; i++) {
    // only add points which have a greater y value than the last seen y
    if (sortedPoints[i].y >= highestY) {
      convexHullPoints.push(sortedPoints[i]);
      highestY = sortedPoints[i].y;
    }
    let frontIterator = i + 1;
    while (
      frontIterator < sortedPoints.length &&
      sortedPoints[i].x === sortedPoints[frontIterator].x
    ) {
      frontIterator++;
    }
    i = frontIterator;
  }
  return convexHullPoints;
}

export function calculatePerClassROCData(
  probabilityY: number[],
  binY: number[]
): IROCData {
  const yData = zipWith(probabilityY, binY, (p: number, y: number) => {
    return {
      binaryY: y,
      probability: p
    };
  });
  const thresholds = orderBy(yData, ["probability"], ["asc"]);

  const points: IPoint[] = [];
  let truePositives = sum(binY);
  let falsePositives = binY.length - truePositives;
  let trueNegatives = 0;
  let falseNegatives = 0;
  addROCPoint(
    truePositives,
    falsePositives,
    trueNegatives,
    falseNegatives,
    points
  );
  for (const threshold of thresholds) {
    if (threshold.binaryY) {
      falseNegatives++;
      truePositives--;
    } else {
      trueNegatives++;
      falsePositives--;
    }
    addROCPoint(
      truePositives,
      falsePositives,
      trueNegatives,
      falseNegatives,
      points
    );
  }
  points.push({ x: 0, y: 0 });

  const rocData: IROCData = {
    points: getConvexHullPoints(points)
  };
  return rocData;
}

function addROCPoint(
  truePositives: number,
  falsePositives: number,
  trueNegatives: number,
  falseNegatives: number,
  points: IPoint[]
): void {
  // prevent division by 0
  const totalNegatives = trueNegatives + falsePositives;
  const totalPositives = truePositives + falseNegatives;
  const tpr = totalPositives === 0 ? 1 : truePositives / totalPositives;
  const fpr = totalNegatives === 0 ? 1 : falsePositives / totalNegatives;
  points.push({ x: fpr, y: tpr });
}

export function binarizeData(
  yData: string[] | number[] | number[][],
  classes: string[] | number[]
): number[][] {
  // binarize labels in a one-vs-all fashion
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
    // TODO: show warning message ?
    return [...getStaticROCData()];
  }

  // TODO: for some reason in the adult census data, classnames doesn't match the true_y data
  // need to confirm how this data aligns. temporarily hard code classnames to 0 and 1 for now
  const cNames = [0, 1];
  const binTrueY = binarizeData(dataset.true_y, cNames);
  // transpose in order to group class data together
  const perClassBinY = unzip(binTrueY);
  const perClassProba = unzip(dataset.probability_y);
  const data = [];
  // loop through each class to calculate roc data per class
  for (const [i, element] of perClassBinY.entries()) {
    const classROCData = calculatePerClassROCData(perClassProba[i], element);
    const classData = {
      data: classROCData.points,
      name: dataset.class_names ? dataset.class_names[i] : "",
      type: "line"
    };
    data.push(classData);
  }

  const allData = [...data, ...getStaticROCData()];
  return allData as SeriesOptionsType[];
}

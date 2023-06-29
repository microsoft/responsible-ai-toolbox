// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { localization } from "@responsible-ai/localization";
import { SeriesOptionsType } from "highcharts";
import { orderBy, sortBy, zipWith } from "lodash";

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

export function calculateROCData(
  probabilityY: number[],
  trueY: number[]
): IROCData {
  const rocData: IROCData = {
    falsePositiveRates: [0],
    truePositiveRates: [0]
  };

  const yData = zipWith(
    probabilityY as number[],
    trueY as number[],
    (probY, trueY) => {
      return {
        // TODO: confirm that it's probability that y == 1
        probabilityY: probY[0],
        trueY
      };
    }
  );
  const sortedY = sortBy(yData, ["probabilityY"]);
  // TODO: remove duplicates of values
  let i = sortedY.length - 1;
  while (i >= 0) {
    let truePositives = 0;
    let trueNegatives = 0;
    let falsePositives = 0;
    let falseNegatives = 0;
    const threshold = sortedY[i].probabilityY;
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
      } else if (y.trueY) {
        falseNegatives++;
      } else {
        trueNegatives++;
      }
    }
    const totalPositives = truePositives + falseNegatives || 1;
    const totalNegatives = falsePositives + trueNegatives || 1;
    const tpr = truePositives / totalPositives;
    const fpr = falsePositives / totalNegatives;
    rocData.truePositiveRates.push(tpr);
    rocData.falsePositiveRates.push(fpr);
    i--;
  }
  return rocData;
}

export function calculateAUCData(dataset: IDataset): SeriesOptionsType[] {
  if (!dataset.probability_y) {
    // TODO: show warning message
    return [...getStaticROCData()];
  }
  const rocData = calculateROCData(
    // TODO: remove cast
    dataset.probability_y as unknown as number[],
    dataset.true_y as number[]
  );
  const data = zipWith(
    rocData.falsePositiveRates,
    rocData.truePositiveRates,
    (fpr, tpr) => {
      return { x: fpr, y: tpr };
    }
  );
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

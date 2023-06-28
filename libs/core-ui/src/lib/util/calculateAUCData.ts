// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { localization } from "@responsible-ai/localization";
import { SeriesOptionsType } from "highcharts";
import { orderBy, sortBy, sum, zipWith } from "lodash";

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
    falsePositiveRates: [],
    truePositiveRates: []
  };

  const yData = zipWith(
    probabilityY as number[],
    trueY as number[],
    (probY, trueY) => {
      return {
        // TODO: confirm that it's probability that y == 1
        probabilityY: probY[1],
        trueY
      };
    }
  );
  const totalPositives = sum(trueY);
  const totalNegatives = trueY.length - totalPositives;
  const sortedY = sortBy(yData, ["probabilityY"]);
  // TODO: remove duplicates of values
  let i = 0;
  while (i < sortedY.length) {
    let truePositives = 0;
    let falsePositives = 0;
    for (const y of sortedY) {
      if (y.trueY) {
        // need some check for predicted ???
        if (y.probabilityY >= sortedY[i].probabilityY) {
          truePositives++;
        } else {
          falsePositives++;
        }
      }
    }
    const tpr = truePositives / totalPositives;
    const fpr = falsePositives / totalNegatives;
    rocData.truePositiveRates.push(tpr);
    rocData.falsePositiveRates.push(fpr);
    i++;
  }
  console.log(rocData);
  return rocData;
}

export function calculateAUCData(dataset: IDataset): SeriesOptionsType[] {
  if (!dataset.probability_y) {
    // TODO: show warning message
    return [...getStaticROCData()];
  }
  console.log(dataset.true_y);
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

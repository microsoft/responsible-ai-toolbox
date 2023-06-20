// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { localization } from "@responsible-ai/localization";
import { SeriesOptionsType } from "highcharts";
import { orderBy } from "lodash";

import { ILabeledStatistic } from "../Interfaces/IStatistic";

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

export function calculateAUCData(
  labeledStatistics: ILabeledStatistic[][]
): SeriesOptionsType[] {
  const data = labeledStatistics.map((statistic) => {
    return { x: statistic[5].stat, y: statistic[3].stat };
  });
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

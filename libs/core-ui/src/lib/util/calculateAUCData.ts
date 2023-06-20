// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { SeriesOptionsType } from "highcharts";

import { generateMetricsList } from "../components/OverallMetricChartUtils";
import { IModelAssessmentContext } from "../Context/ModelAssessmentContext";
import { ModelTypes } from "../Interfaces/IExplanationContext";

import { generateDefaultChartAxes } from "./generateDefaultChartAxes";
import { ChartTypes } from "./IGenericChartProps";

function getStaticROCData(): SeriesOptionsType[] {
  return [
    {
      data: [
        { x: 0, y: 0 },
        { x: 0, y: 1 },
        { x: 1, y: 1 }
      ],
      // TODO: localize
      name: "Ideal",
      type: "line"
    },
    {
      data: [
        { x: 0, y: 0 },
        { x: 1, y: 1 }
      ],
      // TODO: localize
      name: "Random",
      type: "line"
    }
  ];
}

export function calculateAUCData(
  selectedCohort: number,
  context: IModelAssessmentContext
): SeriesOptionsType[] {
  const chartProps = generateDefaultChartAxes(
    context.jointDataset,
    ChartTypes.Scatter
  );
  const metricsList = generateMetricsList(
    context,
    selectedCohort,
    ModelTypes.Binary,
    chartProps
  );
  const data = metricsList.map((metricList) => {
    return { x: metricList[5].stat, y: metricList[3].stat };
  });
  const allData = [
    {
      data,
      name: "AUC",
      type: "line"
    },
    ...getStaticROCData()
  ];
  return allData as SeriesOptionsType[];
}

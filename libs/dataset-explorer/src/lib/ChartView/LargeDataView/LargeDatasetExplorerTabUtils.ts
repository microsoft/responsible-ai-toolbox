// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  Cohort,
  IGenericChartProps,
  JointDataset
} from "@responsible-ai/core-ui";

import { generatePlotlyProps } from "../utils/generatePlotlyProps";
import { getDatasetOption } from "../utils/getDatasetOption";

export async function getDefaultChart(
  dataCohort: Cohort,
  jointDataset: JointDataset,
  chartProps: IGenericChartProps
): Promise<any> {
  const plotlyProps = generatePlotlyProps(jointDataset, chartProps, dataCohort);
  return getDatasetOption(plotlyProps, jointDataset, chartProps);
}

// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { getTheme } from "@fluentui/react";
import { BasicHighChart } from "@responsible-ai/core-ui";
import React from "react";

import { IChartProps } from "../../Interfaces/IChartProps";

import { getTokenImportancesChartOptions } from "./getTokenImportancesChartOptions";

export class BarChart extends React.PureComponent<IChartProps> {
  /*
   * Returns an accessible bar chart from highchart
   */
  public render(): React.ReactNode {
    return (
      <BasicHighChart
        configOverride={getTokenImportancesChartOptions(this.props)}
        theme={getTheme()}
        id="TextExplanationChart"
      />
    );
  }
}

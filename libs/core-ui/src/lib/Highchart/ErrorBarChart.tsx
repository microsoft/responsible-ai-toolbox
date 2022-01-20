// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import _ from "lodash";
import React from "react";

import { HighChartWrapper } from "./HighchartWrapper";
import { ICommonChartProps } from "./ICommonChartProps";

export class ErrorBarChart extends React.Component<ICommonChartProps> {
  public render(): React.ReactNode {
    const { className, fallback, configOverride = {}, theme } = this.props;
    const chartOptions = _.merge({}, configOverride);

    return (
      <HighChartWrapper
        className={className}
        chartOptions={chartOptions}
        fallback={fallback}
        theme={theme}
      />
    );
  }
}

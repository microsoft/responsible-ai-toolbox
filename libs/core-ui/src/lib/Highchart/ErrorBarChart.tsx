// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import _ from "lodash";
import React from "react";

import { ICausalAnalysisSingleData } from "../Interfaces/ICausalAnalysisData";

import { HighChartWrapper } from "./HighchartWrapper";
import { ICommonChartProps, IHighchartsOptions } from "./ICommonChartProps";

export interface IErrorBarChartProps
  extends ICommonChartProps<ICausalAnalysisSingleData[]> {
  highchartsOptions: IHighchartsOptions;
}

export class ErrorBarChart extends React.Component<IErrorBarChartProps> {
  public render(): React.ReactNode {
    const { className, fallback } = this.props;
    const { configOverride = {}, theme } = this.props.highchartsOptions;
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

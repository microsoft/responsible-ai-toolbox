// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import _ from "lodash";
import React from "react";

import { defaultHighchartsOptions } from "./defaultHighchartsOptions";
import { HighchartWrapper } from "./HighchartWrapper";
import { ICommonChartProps } from "./ICommonChartProps";

export class BasicHighChart extends React.Component<ICommonChartProps> {
  public render(): React.ReactNode {
    const { className, fallback, configOverride = {}, theme } = this.props;
    const chartOptions = _.merge({}, configOverride, defaultHighchartsOptions);

    return (
      <HighchartWrapper
        className={className}
        chartOptions={chartOptions}
        fallback={fallback}
        theme={theme}
      />
    );
  }
}

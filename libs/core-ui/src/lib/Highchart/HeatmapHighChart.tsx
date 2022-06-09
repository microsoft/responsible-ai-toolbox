// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { getTheme } from "@fluentui/react";
import _ from "lodash";
import React from "react";

import { getDefaultHighchartOptions } from "./getDefaultHighchartOptions";
import { HighchartWrapper } from "./HighchartWrapper";
import { ICommonChartProps } from "./ICommonChartProps";

export class HeatmapHighChart extends React.Component<ICommonChartProps> {
  public render(): React.ReactNode {
    const defaultOptions = getDefaultHighchartOptions(getTheme());
    const { className, id, fallback, configOverride = {}, theme } = this.props;
    const chartOptions = _.merge({}, configOverride, defaultOptions);

    return (
      <HighchartWrapper
        className={className}
        id={id}
        chartOptions={chartOptions}
        fallback={fallback}
        theme={theme}
        modules={["heatmap", "gantt", "pattern-fill"]}
      />
    );
  }
}

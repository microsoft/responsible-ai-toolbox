// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ITheme } from "@fluentui/react";
import _ from "lodash";
import { mergeStyles } from "office-ui-fabric-react";
import * as React from "react";

import { defaultHighchartsOptions } from "./defaultHighchartsOptions";
import { getHighchartsTheme } from "./getHighchartsTheme";
import { HighchartReact } from "./HighchartReact";
import { HighchartsModuleNames, IHighchartsConfig } from "./HighchartTypes";

export interface IHighChartWrapperProps {
  chartOptions?: IHighchartsConfig;
  className?: string;
  fallback?: React.ReactNode;
  modules?: HighchartsModuleNames[];
  plotClassName?: string;
  theme?: ITheme;
}

export class HighChartWrapper extends React.Component<IHighChartWrapperProps> {
  public render() {
    const { chartOptions = {}, modules, plotClassName, theme } = this.props;
    const { custom = {} } = chartOptions;

    const fallback = this.props.fallback || <div />;
    const themeOptions = theme
      ? getHighchartsTheme(chartOptions, theme, custom.colorAxisMaxColor)
      : {};

    // Theme options need to be applied on to everything to make sure we have the same look for all charts
    const mergedOptions = _.merge(
      {},
      defaultHighchartsOptions,
      chartOptions,
      plotClassName && { chart: { className: plotClassName } },
      themeOptions
    ) as Highcharts.Options;

    const test = _.merge({}, defaultHighchartsOptions, chartOptions);

    if (mergedOptions?.chart) {
      // There is no way to override zoomType with undefined value, merge will just ignore this.
      // To be able to disable zooming, it needs to be specified explicitly.
      if (custom.disableUpdate) {
        mergedOptions.chart.zoomType = undefined;
      }

      // We cannot allow consumers setting background color directly to protect our theme.
      // That's why we have a separate switch to make background transparent
      if (custom.transparentBackground) {
        mergedOptions.chart.backgroundColor = "rgb(0, 0, 0, 0)";
      }
    }

    // We need to set container width and height since loading chart is
    // asynchronous and can cause shifts in the content if chart container
    // does not occupy space initially
    const className = mergeStyles(
      {
        height: mergedOptions?.chart?.height || undefined,
        width: mergedOptions?.chart?.width || undefined
      },
      this.props.className
    );

    return (
      <React.Suspense fallback={fallback}>
        <HighchartReact
          className={className}
          chartOptions={test}
          disableUpdate={custom.disableUpdate}
          modules={modules}
        />
      </React.Suspense>
    );
  }
}

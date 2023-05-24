// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ITheme, getTheme, mergeStyles } from "@fluentui/react";
import _ from "lodash";
import * as React from "react";

import { getDefaultHighchartOptions } from "./getDefaultHighchartOptions";
import { getHighchartsTheme } from "./getHighchartsTheme";
import { HighchartReact } from "./HighchartReact";
import { HighchartsModuleNames } from "./HighchartTypes";
import { IHighchartsConfig } from "./IHighchartsConfig";

export interface IHighchartWrapperProps {
  chartOptions?: IHighchartsConfig;
  className?: string;
  id?: string;
  fallback?: React.ReactNode;
  modules?: HighchartsModuleNames[];
  plotClassName?: string;
  theme?: ITheme;
}

// tslint:disable-next-line: function-name
export class HighchartWrapper extends React.Component<IHighchartWrapperProps> {
  public render(): React.ReactNode {
    const { chartOptions = {}, modules, plotClassName, theme } = this.props;
    const { custom = {} } = chartOptions;

    const fallback = this.props.fallback || <div />;
    const themeOptions = theme
      ? getHighchartsTheme(chartOptions, theme, custom.colorAxisMaxColor)
      : {};

    // Theme options need to be applied on to everything to make sure we have the same look for all charts
    const mergedOptions = _.merge(
      {},
      getDefaultHighchartOptions(getTheme()),
      chartOptions,
      plotClassName && { chart: { className: plotClassName } },
      themeOptions
    );

    if (mergedOptions?.chart) {
      // There is no way to override zoomType with undefined value, merge will just ignore this.
      // To be able to disable zooming, it needs to be specified explicitly.
      if (custom.disableZoom) {
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
        minHeight: custom?.minHeight || undefined,
        minWidth: custom?.minWidth || 210,
        width: mergedOptions?.chart?.width || undefined
      },
      this.props.className
    );
    return (
      <React.Suspense fallback={fallback}>
        <HighchartReact
          className={className}
          id={this.props.id}
          chartOptions={mergedOptions}
          disableUpdate={custom.disableUpdate}
          modules={modules}
        />
      </React.Suspense>
    );
  }
}

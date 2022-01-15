// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ITheme, mergeStyles } from "@fluentui/react";
import _ from "lodash";
import * as React from "react";

import { defaultHighchartsOptions } from "./defaultHighchartsOptions";
import { getHighchartsTheme } from "./getHighchartsTheme";
import { HighchartsModuleNames, IHighchartsConfig } from "./HighchartTypes";

const HighchartReact = React.lazy(async () => {
  return {
    default: await import("./HighchartReact").then((hcr) => hcr.HighchartReact)
  };
});

export interface IHighchartProps {
  chartOptions?: IHighchartsConfig;
  className?: string;
  fallback?: React.ReactNode;
  modules?: HighchartsModuleNames[];
  plotClassName?: string;
  theme?: ITheme;
}

export function highChart(props: IHighchartProps): React.ReactElement {
  const { chartOptions = {}, modules, plotClassName, theme } = props;
  const { custom = {} } = chartOptions;
  const { onSortColors, onUpdate } = custom;

  const fallback = props.fallback || <></>;
  const themeOptions = theme
    ? getHighchartsTheme(
        chartOptions,
        theme,
        onSortColors,
        custom.colorAxisMaxColor
      )
    : {};

  // Theme options need to be applied on to everything to make sure we have the same look for all charts
  const mergedOptions = _.merge(
    {},
    defaultHighchartsOptions,
    chartOptions,
    plotClassName && { chart: { className: plotClassName } },
    themeOptions
  ) as Highcharts.Options;

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
    props.className
  );

  return (
    <React.Suspense fallback={fallback}>
      <HighchartReact
        className={className}
        chartOptions={mergedOptions}
        disableUpdate={custom.disableUpdate}
        modules={modules}
        onUpdate={onUpdate}
      />
    </React.Suspense>
  );
}

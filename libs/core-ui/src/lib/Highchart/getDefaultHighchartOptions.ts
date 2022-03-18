// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ITheme } from "office-ui-fabric-react";

export function getDefaultHighchartOptions(theme: ITheme): Highcharts.Options {
  const colorTheme = {
    axisColor: theme?.palette.neutralPrimary,
    axisGridColor: theme?.palette.neutralLight,
    backgroundColor: theme?.palette.white,
    fontColor: theme?.semanticColors.bodyText
  };
  return {
    chart: {
      animation: false,
      backgroundColor: colorTheme.backgroundColor,
      panKey: "ctrl",
      panning: {
        enabled: true,
        type: "xy"
      },
      resetZoomButton: {
        position: {
          verticalAlign: "top",
          x: -4,
          y: 4
        },
        relativeTo: "plotBox"
      },
      spacingBottom: 16,
      spacingLeft: 16,
      spacingRight: 16,
      spacingTop: 16,
      zoomType: "xy"
    },
    credits: undefined,
    plotOptions: {
      area: {
        marker: {
          enabled: false
        }
      },
      line: {
        marker: {
          enabled: false
        }
      },
      scatter: {
        marker: {
          radius: 3,
          symbol: "circle"
        }
      }
    },
    time: {
      useUTC: false
    },
    title: {
      style: {
        color: colorTheme.fontColor,
        fontSize: "13px"
      },
      text: undefined
    },
    tooltip: {
      shared: true
    },
    xAxis: {
      gridLineWidth: 0,
      labels: {
        style: {
          color: colorTheme.fontColor
        }
      },
      title: {
        text: undefined
      }
    },
    yAxis: {
      gridLineWidth: 1,
      labels: {
        overflow: "justify",
        style: {
          color: colorTheme.fontColor
        }
      },
      title: {
        text: undefined
      }
    },
    zAxis: {
      gridLineWidth: 1,
      title: {
        text: undefined
      }
    }
  };
}

// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ITheme } from "@fluentui/react";
import * as Highcharts from "highcharts";

export function getDefaultHighchartOptions(theme: ITheme): Highcharts.Options {
  const colorTheme = {
    axisColor: theme?.palette.neutralPrimary,
    axisGridColor: theme?.palette.neutralLight,
    backgroundColor: theme?.semanticColors.bodyBackground,
    fontColor: theme?.semanticColors.bodyText
  };
  return {
    accessibility: {
      screenReaderSection: { beforeChartFormat: "" }
    },
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
    exporting: {
      menuItemDefinitions: {
        viewFullscreen: {
          onclick(): void {
            this.update({
              tooltip: {
                outside: this.fullscreen.isOpen
              }
            });
            this.fullscreen.toggle();
          },
          textKey: "viewFullscreen"
        }
      }
    },
    legend: {
      enabled: false
    },
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
          radius: 3
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
      outside: true,
      shared: true
    },
    xAxis: {
      gridLineWidth: 0,
      labels: {
        style: {
          color: colorTheme.fontColor,
          textOverflow: "ellipsis"
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

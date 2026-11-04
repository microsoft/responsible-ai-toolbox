// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ITheme } from "@fluentui/react";
import * as Highcharts from "highcharts";

import { IColorNames } from "../util/FluentUIStyles";

import { getChartColors, getChartColorsMap } from "./ChartColors";
import { IHighchartsConfig } from "./IHighchartsConfig";

function getStyleProperty(
  style: object | undefined,
  property: string
): string | undefined {
  if (!style || !(property in style)) {
    return undefined;
  }

  const value: unknown = Reflect.get(style, property);
  return typeof value === "string" || typeof value === "number"
    ? value.toString()
    : undefined;
}

export function getHighchartsTheme(
  chartOptions: IHighchartsConfig,
  theme: ITheme,
  colorAxisMaxColor?: keyof IColorNames
): Highcharts.Options {
  const { white } = theme.palette;

  const { bodyBackground, bodySubtext, bodyText, variantBorder } =
    theme.semanticColors;
  const { medium: mediumFont, small: smallFont, tiny: tinyFont } = theme.fonts;

  const chartColors = getChartColorsMap(theme);

  const colors: string[] = getChartColors(theme);

  let colorAxis: Highcharts.ColorAxisOptions | undefined;
  if (colorAxisMaxColor) {
    colorAxis = {
      maxColor: chartColors.get(colorAxisMaxColor),
      minColor: white
    };
  }

  return {
    chart: {
      backgroundColor: bodyBackground,
      style: {
        color: bodyText,
        fontFamily: mediumFont.fontFamily,
        fontSize: mediumFont.fontSize?.toString(),
        fontWeight: mediumFont.fontWeight?.toString()
      }
    },
    colorAxis,
    colors,
    legend: {
      itemHoverStyle: {
        color: bodyText,
        fontSize: smallFont.fontSize?.toString(),
        fontWeight: smallFont.fontWeight?.toString()
      },
      itemStyle: {
        color: bodyText,
        fontSize: smallFont.fontSize?.toString(),
        fontWeight: smallFont.fontWeight?.toString()
      }
    },
    plotOptions: {
      series: {
        dataLabels: {
          style: {
            color: bodyText,
            fontSize: smallFont.fontSize?.toString(),
            fontWeight: smallFont.fontWeight?.toString(),
            textOutline: "none"
          }
        }
      }
    },
    subtitle: {
      style: {
        color: bodySubtext,
        fontSize:
          getStyleProperty(chartOptions.subtitle?.style, "fontSize") ||
          smallFont.fontSize?.toString(),
        fontWeight:
          getStyleProperty(chartOptions.subtitle?.style, "fontWeight") ||
          smallFont.fontWeight?.toString()
      }
    },
    title: {
      style: {
        color: bodyText,
        fontSize:
          getStyleProperty(chartOptions.title?.style, "fontSize") ||
          mediumFont.fontSize?.toString(),
        fontWeight:
          getStyleProperty(chartOptions.title?.style, "fontWeight") ||
          mediumFont.fontWeight?.toString()
      }
    },
    xAxis: {
      gridLineColor: variantBorder,
      labels: {
        style: {
          color: bodyText,
          fontSize: tinyFont.fontSize?.toString(),
          fontWeight: tinyFont.fontWeight?.toString()
        }
      },
      title: {
        style: {
          color: bodyText,
          fontSize: smallFont.fontSize?.toString(),
          fontWeight: smallFont.fontWeight?.toString()
        }
      }
    },
    yAxis: {
      gridLineColor: variantBorder,
      labels: {
        style: {
          color: bodyText,
          fontSize: tinyFont.fontSize?.toString(),
          fontWeight: tinyFont.fontWeight?.toString()
        }
      },
      title: {
        style: {
          color: bodyText,
          fontSize: smallFont.fontSize?.toString(),
          fontWeight: smallFont.fontWeight?.toString()
        }
      }
    },
    zAxis: {
      gridLineColor: variantBorder,
      labels: {
        style: {
          color: bodyText,
          fontSize: tinyFont.fontSize?.toString(),
          fontWeight: tinyFont.fontWeight?.toString()
        }
      },
      title: {
        style: {
          color: bodyText,
          fontSize: smallFont.fontSize?.toString(),
          fontWeight: smallFont.fontWeight?.toString()
        }
      }
    }
  };
}

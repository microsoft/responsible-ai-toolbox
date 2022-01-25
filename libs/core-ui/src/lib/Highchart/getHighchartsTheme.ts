// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ITheme } from "@fluentui/react";

import { IHighchartsConfig } from "./HighchartTypes";

export interface IChartColorNames {
  black: string;
  blueMid: string;
  magentaDark: string;
  magentaLight: string;
  neutral: string;
  orangeLighter: string;
  primary: string;
  primaryLight: string;
  purple: string;
  purpleLight: string;
  red: string;
  redDark: string;
  teal: string;
}

export function getHighchartsTheme(
  chartOptions: IHighchartsConfig,
  theme: ITheme,
  colorAxisMaxColor?: keyof IChartColorNames
): Highcharts.Options {
  const {
    black,
    blueMid,
    magentaDark,
    magentaLight,
    neutralSecondaryAlt,
    orangeLighter,
    purple,
    purpleLight,
    red,
    redDark,
    teal,
    themeLight,
    themePrimary,
    white
  } = theme.palette;

  const { bodyBackground, bodySubtext, bodyText, variantBorder } =
    theme.semanticColors;
  const { medium: mediumFont, small: smallFont, tiny: tinyFont } = theme.fonts;

  const chartColors = new Map<keyof IChartColorNames, string>([
    ["primary", themePrimary],
    ["blueMid", blueMid],
    ["teal", teal],
    ["purple", purple],
    ["purpleLight", purpleLight],
    ["magentaDark", magentaDark],
    ["magentaLight", magentaLight],
    ["black", black],
    ["orangeLighter", orangeLighter],
    ["redDark", redDark],
    ["red", red],
    ["neutral", neutralSecondaryAlt],
    ["primaryLight", themeLight]
  ]);

  const colors: string[] = [...chartColors.values()];

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
          chartOptions.subtitle?.style?.fontSize ||
          smallFont.fontSize?.toString(),
        fontWeight:
          chartOptions.subtitle?.style?.fontWeight ||
          smallFont.fontWeight?.toString()
      }
    },
    title: {
      style: {
        color: bodyText,
        fontSize:
          chartOptions.title?.style?.fontSize ||
          mediumFont.fontSize?.toString(),
        fontWeight:
          chartOptions.title?.style?.fontWeight ||
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

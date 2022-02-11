// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ITheme } from "@fluentui/react";
import { localization } from "@responsible-ai/localization";

import { IHighchartsConfig } from "../Highchart/HighchartTypes";
import { ICausalPolicyGains } from "../Interfaces/ICausalAnalysisData";

export function getTreatmentBarChartOptions(
  data: ICausalPolicyGains,
  title: string,
  theme?: ITheme
): IHighchartsConfig {
  const colorTheme = {
    axisColor: theme?.palette.neutralPrimary,
    axisGridColor: theme?.palette.neutralLight,
    backgroundColor: theme?.palette.white,
    fontColor: theme?.semanticColors.bodyText
  };
  const alwaysTreats = data?.treatment_gains
    ? Object.keys(data?.treatment_gains).map((t) =>
        localization.formatString(
          localization.CausalAnalysis.TreatmentPolicy.alwaysTreat,
          t
        )
      )
    : [];
  const xData = data?.treatment_gains
    ? [...Object.values(data?.treatment_gains), data?.recommended_policy_gains]
    : [data?.recommended_policy_gains];
  const yData = data?.treatment_gains
    ? [...alwaysTreats, localization.Counterfactuals.recommendedPolicy]
    : [localization.Counterfactuals.recommendedPolicy];
  return {
    chart: {
      animation: false,
      backgroundColor: colorTheme.backgroundColor,
      type: "bar"
    },
    credits: {
      enabled: false
    },
    legend: {},
    plotOptions: {
      bar: {
        dataLabels: {
          enabled: true
        }
      }
    },
    series: [
      {
        color: colorTheme.axisColor,
        data: xData,
        dataLabels: {
          color: colorTheme.fontColor
        },
        name: "",
        type: "bar"
      }
    ],
    title: {
      style: {
        color: colorTheme.fontColor,
        fontSize: "13px"
      },
      text: title
    },
    xAxis: {
      categories: yData,
      labels: {
        style: {
          color: colorTheme.fontColor
        }
      },
      title: {
        text: ""
      }
    },
    yAxis: {
      labels: {
        overflow: "justify",
        style: {
          color: colorTheme.fontColor
        }
      },
      min: 0,
      title: {
        align: "high",
        text: ""
      }
    }
  };
}

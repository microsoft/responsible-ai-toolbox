// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ITheme } from "@fluentui/react";
import {
  getPrimaryChartColor,
  IHighchartsConfig,
  ICausalPolicyGains
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";

export function getTreatmentBarChartOptions(
  data: ICausalPolicyGains,
  title: string,
  theme: ITheme
): IHighchartsConfig {
  const colorTheme = {
    axisColor: theme?.palette.neutralPrimary,
    axisGridColor: theme?.palette.neutralLight,
    backgroundColor: theme?.semanticColors.bodyBackground,
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
      backgroundColor: colorTheme.backgroundColor,
      type: "bar"
    },
    series: [
      {
        color: getPrimaryChartColor(theme),
        data: xData,
        dataLabels: {
          color: colorTheme.fontColor
        },
        name: "",
        type: "bar"
      }
    ],
    title: {
      text: title
    },
    xAxis: {
      categories: yData
    }
  };
}

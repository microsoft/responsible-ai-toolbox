// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { getTheme, Stack, Text } from "@fluentui/react";
import {
  BasicHighChart,
  defaultModelAssessmentContext,
  getPrimaryChartColor,
  ICounterfactualData,
  ifEnableLargeData,
  LoadingSpinner,
  MissingParametersPlaceholder,
  ModelAssessmentContext
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import React from "react";

export interface ILocalImportanceChartProps {
  rowNumber?: number;
  currentClass: string;
  data: ICounterfactualData;
  theme?: string;
  isCounterfactualsDataLoading?: boolean;
  localCounterfactualErrorMessage?: string;
}

export interface ILocalImportanceData {
  label: string;
  value: number;
}

export class LocalImportanceChart extends React.PureComponent<ILocalImportanceChartProps> {
  public static contextType = ModelAssessmentContext;
  public context: React.ContextType<typeof ModelAssessmentContext> =
    defaultModelAssessmentContext;

  public render(): React.ReactNode {
    if (this.props.rowNumber === undefined) {
      return (
        <MissingParametersPlaceholder>
          {localization.Counterfactuals.localImportanceSelectData}
        </MissingParametersPlaceholder>
      );
    }

    if (this.props.localCounterfactualErrorMessage) {
      return (
        <MissingParametersPlaceholder>
          {localization.formatString(
            localization.Counterfactuals.localImportanceFetchError,
            this.props.localCounterfactualErrorMessage
          )}
        </MissingParametersPlaceholder>
      );
    }

    return (
      <Stack horizontal={false} grow tokens={{ childrenGap: "l1" }}>
        <Stack.Item>
          <Text variant={"medium"} id="LocalImportanceDescription">
            {localization.formatString(
              localization.Counterfactuals.localImportanceDescription,
              this.props.rowNumber,
              this.props.currentClass
            )}
          </Text>
        </Stack.Item>
        <Stack.Item>
          {this.props.isCounterfactualsDataLoading ? (
            <LoadingSpinner label={localization.Counterfactuals.loading} />
          ) : (
            <BasicHighChart
              configOverride={this.getLocalImportanceBarOptions()}
              id={"WhatIfFeatureImportanceBar"}
            />
          )}
        </Stack.Item>
      </Stack>
    );
  }
  private getLocalImportanceBarOptions(): any {
    const sortedData = this.getSortedData();
    const x = sortedData.map((d) => d.label);
    const y = sortedData.map((d) => d.value);
    const theme = getTheme();
    const seriesData = [
      {
        color: getPrimaryChartColor(theme),
        data: y,
        name: ""
      }
    ];
    return {
      chart: {
        backgroundColor: theme.semanticColors.bodyBackground,
        type: "column"
      },
      series: seriesData,
      title: {
        text: ""
      },
      xAxis: {
        categories: x
      },
      yAxis: {
        title: {
          text: localization.Counterfactuals.WhatIf
            .percentCounterfactualLocalImportance
        }
      }
    };
  }
  private getSortedData(): ILocalImportanceData[] {
    const data: ILocalImportanceData[] = [];
    if (this.props.rowNumber === undefined) {
      return data;
    }
    const localImportanceData = ifEnableLargeData(this.context.dataset)
      ? this.props.data?.local_importance?.[0]
      : this.props.data?.local_importance?.[this.props.rowNumber];
    if (!localImportanceData) {
      return data;
    }
    this.props.data.feature_names.forEach((f, index) => {
      data.push({
        label: f,
        value: localImportanceData[index] || -Infinity
      });
    });
    data.sort((d1, d2) => d2.value - d1.value);
    return data;
  }
}

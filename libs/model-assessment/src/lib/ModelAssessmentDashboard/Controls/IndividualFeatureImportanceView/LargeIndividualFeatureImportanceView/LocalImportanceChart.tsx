// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { getTheme, Stack, Text } from "@fluentui/react";
import {
  BasicHighChart,
  DatasetTaskType,
  defaultModelAssessmentContext,
  getPrimaryChartColor,
  ifEnableLargeData,
  LoadingSpinner,
  MissingParametersPlaceholder,
  ModelAssessmentContext
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import React from "react";

export interface ILocalImportanceChartProps {
  rowNumber?: number;
  data: any;
  theme?: string;
  isLocalExplanationsDataLoading?: boolean;
  localExplanationsErrorMessage?: string;
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

    if (this.props.localExplanationsErrorMessage) {
      return (
        <MissingParametersPlaceholder>
          {localization.formatString(
            localization.Counterfactuals.localImportanceFetchError,
            this.props.localExplanationsErrorMessage
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
              this.getCurrentLabel(
                this.context.dataset.task_type,
                this.props.data?.desired_range,
                this.props.data.desired_class
              )
            )}
          </Text>
        </Stack.Item>
        <Stack.Item>
          {this.props.isLocalExplanationsDataLoading ? (
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
    const seriesData = [
      {
        color: getPrimaryChartColor(getTheme()),
        data: y,
        name: ""
      }
    ];
    return {
      chart: {
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
            .percentCounterfactualLocalImportance //update this
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
    this.props.data.feature_names.forEach((f: any, index: string | number) => {
      data.push({
        label: f,
        value: localImportanceData[index] || -Infinity
      });
    });
    data.sort((d1, d2) => d2.value - d1.value);
    return data;
  }

  private getCurrentLabel(
    taskType: DatasetTaskType,
    desiredRange?: [number, number],
    desiredClass?: string
  ): string {
    if (taskType === DatasetTaskType.Regression) {
      return `[${desiredRange}]`;
    }

    return desiredClass || "";
  }
}

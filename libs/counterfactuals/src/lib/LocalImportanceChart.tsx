// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  BasicHighChart,
  defaultModelAssessmentContext,
  FabricStyles,
  ICounterfactualData,
  MissingParametersPlaceholder,
  ModelAssessmentContext
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import { Stack, Text } from "office-ui-fabric-react";
import React from "react";

export interface ILocalImportanceChartProps {
  rowNumber?: number;
  currentClass: string;
  data: ICounterfactualData;
  theme?: string;
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
    return (
      <Stack horizontal={false} grow tokens={{ padding: "l1" }}>
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
          <div id={"WhatIfFeatureImportanceBar"}>
            <BasicHighChart
              configOverride={this.getLocalImportanceBarOptions()}
            />
          </div>
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
        color: FabricStyles.fabricColorPalette[0],
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
      }
    };
  }
  private getSortedData(): ILocalImportanceData[] {
    const data: ILocalImportanceData[] = [];
    if (this.props.rowNumber === undefined) {
      return data;
    }
    const localImportanceData =
      this.props.data?.local_importance?.[this.props.rowNumber];
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

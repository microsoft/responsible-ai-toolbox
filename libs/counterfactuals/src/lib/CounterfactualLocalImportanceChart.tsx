// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Stack } from "@fluentui/react";
import {
  defaultModelAssessmentContext,
  ModelAssessmentContext,
  ICounterfactualData
} from "@responsible-ai/core-ui";
import React from "react";

import { getCurrentLabel } from "../util/getCurrentLabel";

import { counterfactualChartStyles } from "./CounterfactualChart.styles";
import { LocalImportanceChart } from "./LocalImportanceChart";

export interface ICounterfactualLocalImportanceChartProps {
  data: ICounterfactualData;
  selectedPointsIndexes: number[];
  isCounterfactualsDataLoading?: boolean;
  localCounterfactualErrorMessage?: string;
}

export class CounterfactualLocalImportanceChart extends React.PureComponent<ICounterfactualLocalImportanceChartProps> {
  public static contextType = ModelAssessmentContext;
  public context: React.ContextType<typeof ModelAssessmentContext> =
    defaultModelAssessmentContext;

  public render(): React.ReactNode {
    const classNames = counterfactualChartStyles();
    return (
      <Stack.Item className={classNames.lowerChartContainer}>
        <LocalImportanceChart
          rowNumber={this.props.selectedPointsIndexes[0]}
          currentClass={getCurrentLabel(
            this.context.dataset.task_type,
            this.props.data?.desired_range,
            this.props.data.desired_class
          )}
          data={this.props.data}
          isCounterfactualsDataLoading={this.props.isCounterfactualsDataLoading}
          localCounterfactualErrorMessage={
            this.props.localCounterfactualErrorMessage
          }
        />
      </Stack.Item>
    );
  }
}

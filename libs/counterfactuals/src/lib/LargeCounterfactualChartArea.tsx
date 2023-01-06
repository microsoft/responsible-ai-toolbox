// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { getTheme, DefaultButton, Stack } from "@fluentui/react";
import {
  defaultModelAssessmentContext,
  ModelAssessmentContext,
  BasicHighChart,
  LoadingSpinner
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import React from "react";

import { counterfactualChartStyles } from "./CounterfactualChart.styles";

export interface ILargeCounterfactualChartAreaProps {
  xAxisProperty: string;
  yAxisProperty: string;
  plotData: any;
  isBubbleChartDataLoading?: boolean;
  isCounterfactualsDataLoading?: boolean;
  setXDialogOpen: () => void;
  setYDialogOpen: () => void;
}

export class LargeCounterfactualChartArea extends React.PureComponent<ILargeCounterfactualChartAreaProps> {
  public static contextType = ModelAssessmentContext;
  public context: React.ContextType<typeof ModelAssessmentContext> =
    defaultModelAssessmentContext;
  private readonly chartAndConfigsId = "IndividualFeatureImportanceChart";

  public render(): React.ReactNode {
    const classNames = counterfactualChartStyles();
    return (
      <Stack horizontal={false}>
        <Stack.Item className={classNames.chartWithVertical}>
          <Stack horizontal id={this.chartAndConfigsId}>
            <Stack.Item className={classNames.verticalAxis}>
              <div className={classNames.rotatedVerticalBox}>
                <DefaultButton
                  onClick={this.props.setYDialogOpen}
                  text={
                    this.context.jointDataset.metaDict[this.props.yAxisProperty]
                      .abbridgedLabel
                  }
                  title={
                    this.context.jointDataset.metaDict[this.props.yAxisProperty]
                      .label
                  }
                  disabled={
                    this.props.isCounterfactualsDataLoading ||
                    this.props.isBubbleChartDataLoading
                  }
                />
              </div>
            </Stack.Item>
            <Stack.Item className={classNames.mainChartContainer}>
              {this.props.isBubbleChartDataLoading ? (
                <LoadingSpinner label={localization.Counterfactuals.loading} />
              ) : (
                <BasicHighChart
                  configOverride={this.props.plotData}
                  theme={getTheme()}
                  id="CounterfactualChart"
                />
              )}
            </Stack.Item>
          </Stack>
        </Stack.Item>
        <Stack className={classNames.horizontalAxisWithPadding}>
          <div className={classNames.horizontalAxis}>
            <DefaultButton
              onClick={this.props.setXDialogOpen}
              text={
                this.context.jointDataset.metaDict[this.props.xAxisProperty]
                  .abbridgedLabel
              }
              title={
                this.context.jointDataset.metaDict[this.props.xAxisProperty]
                  .label
              }
              disabled={
                this.props.isCounterfactualsDataLoading ||
                this.props.isBubbleChartDataLoading
              }
            />
          </div>
        </Stack>
      </Stack>
    );
  }
}

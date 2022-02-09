// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  Cohort,
  JointDataset,
  IExplanationModelMetadata,
  ModelTypes,
  WeightVectorOption,
  IGenericChartProps,
  BasicHighChart,
  getDependencyChartOptions
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import _ from "lodash";
import { getTheme, Text } from "office-ui-fabric-react";
import React from "react";

import { getDependenceData } from "../../utils/getDependenceData";

import { dependencePlotStyles } from "./DependencePlot.styles";

export interface IDependencyHighChartProps {
  chartProps: IGenericChartProps | undefined;
  jointDataset: JointDataset;
  cohort: Cohort;
  cohortIndex: number;
  metadata: IExplanationModelMetadata;
  selectedWeight: WeightVectorOption;
  selectedWeightLabel: string;
  onChange: (props: IGenericChartProps) => void;
}

export class DependencyHighChart extends React.PureComponent<IDependencyHighChartProps> {
  public render(): React.ReactNode {
    const classNames = dependencePlotStyles();
    if (this.props.chartProps === undefined) {
      return (
        <div className={classNames.secondaryChartPlacolderBox}>
          <div className={classNames.secondaryChartPlacolderSpacer}>
            <Text variant="large" className={classNames.faintText}>
              {localization.Interpret.DependencePlot.placeholder}
            </Text>
          </div>
        </div>
      );
    }
    const yAxisLabel =
      this.props.metadata.modelType === ModelTypes.Regression
        ? this.props.jointDataset.metaDict[this.props.chartProps.xAxis.property]
            .label
        : `${
            this.props.jointDataset.metaDict[
              this.props.chartProps.xAxis.property
            ].label
          } : ${this.props.selectedWeightLabel}`;
    return (
      <div className={classNames.DependencePlot}>
        <div className={classNames.chartWithAxes}>
          <div className={classNames.chartWithVertical}>
            <div className={classNames.verticalAxis}>
              <div className={classNames.rotatedVerticalBox}>
                <Text variant={"medium"} block>
                  {localization.Interpret.DependencePlot.featureImportanceOf}
                </Text>
                <Text variant={"medium"}>{yAxisLabel}</Text>
              </div>
            </div>
            <div className={classNames.chart}>
              <BasicHighChart
                configOverride={getDependencyChartOptions(
                  getDependenceData(
                    this.props.chartProps,
                    this.props.jointDataset,
                    this.props.cohort
                  ),
                  this.props.jointDataset.metaDict[
                    this.props.chartProps.xAxis.property
                  ].sortedCategoricalValues,
                  getTheme()
                )}
              />
            </div>
          </div>
          <div className={classNames.horizontalAxisWithPadding}>
            <div className={classNames.paddingDiv} />
            <div className={classNames.horizontalAxis}>
              <Text variant={"medium"}>
                {
                  this.props.jointDataset.metaDict[
                    this.props.chartProps.xAxis.property
                  ].label
                }
              </Text>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

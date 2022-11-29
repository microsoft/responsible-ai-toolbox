// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { getTheme, Stack, Text } from "@fluentui/react";
import { localization } from "@responsible-ai/localization";
import React from "react";

import { Cohort } from "../Cohort/Cohort";
import {
  IExplanationModelMetadata,
  ModelTypes
} from "../Interfaces/IExplanationContext";
import { WeightVectorOption } from "../Interfaces/IWeightedDropdownContext";
import { FluentUIStyles } from "../util/FluentUIStyles";
import { getDependenceData } from "../util/getDependenceData";
import { getDependencyChartOptions } from "../util/getDependencyChartOptions";
import { IGenericChartProps } from "../util/IGenericChartProps";
import { JointDataset } from "../util/JointDataset";

import { BasicHighChart } from "./BasicHighChart";
import { dependencePlotStyles } from "./FeatureImportanceDependence.styles";

export interface IFeatureImportanceDependenceProps {
  chartProps: IGenericChartProps | undefined;
  jointDataset: JointDataset;
  cohort: Cohort;
  cohortIndex: number;
  logarithmicScaling: boolean;
  metadata: IExplanationModelMetadata;
  selectedWeight: WeightVectorOption;
  selectedWeightLabel: string;
}

export class FeatureImportanceDependence extends React.PureComponent<IFeatureImportanceDependenceProps> {
  public render(): React.ReactNode {
    const classNames = dependencePlotStyles();
    if (this.props.chartProps === undefined) {
      return (
        <div className={classNames.secondaryChartPlaceholderBox}>
          <div className={classNames.secondaryChartPlaceholderSpacer}>
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
      <Stack horizontal={false} className={classNames.DependencePlot}>
        <Stack.Item className={classNames.chartWithVertical}>
          <Stack horizontal className={classNames.chartWithVertical}>
            <Stack.Item className={classNames.verticalAxis}>
              <div className={classNames.rotatedVerticalBox}>
                <Text variant={"medium"} block className={classNames.boldText}>
                  {localization.Interpret.DependencePlot.featureImportanceOf}
                </Text>
                <Text variant={"medium"}>{yAxisLabel}</Text>
              </div>
            </Stack.Item>
            <Stack.Item className={classNames.chart}>
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
                  FluentUIStyles.fluentUIColorPalette[this.props.cohortIndex],
                  this.props.logarithmicScaling,
                  getTheme()
                )}
              />
            </Stack.Item>
          </Stack>
        </Stack.Item>
        <Stack.Item className={classNames.horizontalAxisWithPadding}>
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
        </Stack.Item>
      </Stack>
    );
  }
}

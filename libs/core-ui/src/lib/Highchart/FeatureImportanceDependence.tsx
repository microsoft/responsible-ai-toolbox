// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { localization } from "@responsible-ai/localization";
import _ from "lodash";
import { getTheme, Text } from "office-ui-fabric-react";
import React from "react";

import { Cohort } from "../Cohort/Cohort";
import { IExplanationModelMetadata } from "../Interfaces/IExplanationContext";
import { WeightVectorOption } from "../Interfaces/IWeightedDropdownContext";
import { getDependenceData } from "../util/getDependenceData";
import { IGenericChartProps } from "../util/IGenericChartProps";
import { JointDataset } from "../util/JointDataset";

import { dependencePlotStyles } from "./FeatureImportanceDependence.styles";

export interface IFeatureImportanceDependenceProps {
  chartProps: IGenericChartProps | undefined;
  jointDataset: JointDataset;
  cohort: Cohort;
  cohortIndex: number;
  metadata: IExplanationModelMetadata;
  selectedWeight: WeightVectorOption;
  selectedWeightLabel: string;
  onChange: (props: IGenericChartProps) => void;
}

export class FeatureImportanceDependence extends React.PureComponent<IFeatureImportanceDependenceProps> {
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
                  FabricStyles.fabricColorPalette[this.props.cohortIndex],
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

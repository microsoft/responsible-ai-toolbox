// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  Stack,
  Label,
  ComboBox,
  IComboBox,
  IComboBoxOption
} from "@fluentui/react";
import {
  defaultModelAssessmentContext,
  isTimeOrTimeSeriesIDColumn,
  ModelAssessmentContext
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import React from "react";

import { forecastingDashboardStyles } from "../ForecastingDashboard.styles";
import { Operation, Feature } from "../Interfaces/Transformation";

import { TransformationCreationCategorical } from "./TransformationCreationCategorical";
import { TransformationCreationContinuous } from "./TransformationCreationContinuous";

export interface ITransformationCreationProps {
  transformationName?: string;
  transformationOperation?: Operation;
  transformationFeature?: Feature;
  transformationValue: string;
  transformationValueErrorMessage?: string;
  onChangeTransformationFeature: (item: IComboBoxOption) => void;
  onChangeTransformationValue: (newValue: string) => void;
  onChangeTransformationOperation: (operation: Operation) => void;
}

interface ITransformationCreationState {
  featureOptions: IComboBoxOption[];
}

export class TransformationCreation extends React.Component<
  ITransformationCreationProps,
  ITransformationCreationState
> {
  public static contextType = ModelAssessmentContext;
  public context: React.ContextType<typeof ModelAssessmentContext> =
    defaultModelAssessmentContext;

  public constructor(props: ITransformationCreationProps) {
    super(props);
    this.state = { featureOptions: [] };
  }

  public componentDidMount(): void {
    this.setState({
      featureOptions: this.context.dataset.feature_names
        .map((featureName, idx) => {
          return { featureName, idx };
        })
        .filter(({ featureName }) => {
          return !isTimeOrTimeSeriesIDColumn(
            featureName,
            this.context.dataset.feature_metadata
          );
        })
        .map(({ featureName, idx }) => {
          const columnMetaName = `Data${idx.toString()}`;
          return {
            key: columnMetaName,
            text: featureName
          } as IComboBoxOption;
        })
    });
  }

  public render(): React.ReactNode {
    const classNames = forecastingDashboardStyles();

    return (
      <Stack
        horizontal
        tokens={{
          childrenGap: "l1"
        }}
      >
        <Stack.Item>
          <Label>
            {
              localization.Forecasting.TransformationCreation
                .featureDropdownHeader
            }
          </Label>
          <ComboBox
            id={"ForecastingWhatIfTransformationFeatureDropdown"}
            errorMessage={
              this.props.transformationFeature === undefined
                ? localization.Forecasting.TransformationCreation
                    .featureInstructions
                : undefined
            }
            options={this.state.featureOptions}
            selectedKey={this.props.transformationFeature?.key}
            className={classNames.smallDropdown}
            onChange={this.onChangeTransformationFeature}
          />
        </Stack.Item>
        {this.isFeatureSelected() && this.isCategoricalFeature() && (
          <TransformationCreationCategorical
            transformationFeature={this.props.transformationFeature}
            onChangeTransformationValue={this.props.onChangeTransformationValue}
            transformationValueErrorMessage={
              this.props.transformationValueErrorMessage
            }
          />
        )}
        {this.isFeatureSelected() && !this.isCategoricalFeature() && (
          <TransformationCreationContinuous
            transformationFeature={this.props.transformationFeature}
            transformationValue={this.props.transformationValue}
            transformationOperation={this.props.transformationOperation}
            onChangeTransformationValue={this.props.onChangeTransformationValue}
            onChangeTransformationOperation={
              this.props.onChangeTransformationOperation
            }
            transformationValueErrorMessage={
              this.props.transformationValueErrorMessage
            }
          />
        )}
      </Stack>
    );
  }

  private isCategoricalFeature = (): boolean => {
    if (this.props.transformationFeature) {
      const featureMeta =
        this.context.jointDataset.metaDict[
          this.props.transformationFeature.key
        ];
      if (featureMeta.isCategorical || featureMeta.treatAsCategorical) {
        return true;
      }
    }
    return false;
  };

  private isFeatureSelected = (): boolean => {
    return (
      this.props.transformationFeature !== undefined &&
      this.context !== undefined
    );
  };

  private onChangeTransformationFeature = (
    _event: React.FormEvent<IComboBox>,
    item?: IComboBoxOption
  ): void => {
    if (item) {
      this.props.onChangeTransformationFeature(item);
    }
  };
}

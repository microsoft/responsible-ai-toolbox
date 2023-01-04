// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  Stack,
  Text,
  Label,
  ComboBox,
  IComboBox,
  IComboBoxOption,
  SpinButton
} from "@fluentui/react";
import {
  defaultModelAssessmentContext,
  ModelAssessmentContext
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import React from "react";

import { forecastingDashboardStyles } from "../ForecastingDashboard.styles";
import {
  Operation,
  transformationOperations,
  Feature,
  isMultiplicationOrDivision
} from "../Interfaces/Transformation";

export interface ITransformationCreationProps {
  transformationName?: string;
  transformationOperation?: Operation;
  transformationFeature?: Feature;
  transformationValue: number;
  transformationValueErrorMessage?: string;
  onChangeTransformationFeature: (item: IComboBoxOption) => void;
  onChangeTransformationValue: (newValue: number) => void;
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

  private transformationValueStep = 0.01;

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
        .filter(({ featureName, idx }) => {
          const columnMetaName = `Data${idx.toString()}`;
          const columnMetadata =
            this.context.jointDataset.metaDict[columnMetaName];
          const isDatetimeFeature =
            this.context.dataset.feature_metadata?.datetime_features?.includes(
              featureName
            ) ?? false;
          const isTimeSeriesIdColumn =
            this.context.dataset.feature_metadata?.time_series_id_column_names?.includes(
              featureName
            ) ?? false;
          return (
            !columnMetadata.isCategorical &&
            !columnMetadata.treatAsCategorical &&
            !isDatetimeFeature &&
            !isTimeSeriesIdColumn
          );
        })
        .map(({ featureName, idx }) => {
          return {
            key: `Data${idx.toString()}`,
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
        <Stack.Item>
          <Label>
            {
              localization.Forecasting.TransformationCreation
                .operationDropdownHeader
            }
          </Label>
          <ComboBox
            errorMessage={
              this.props.transformationOperation === undefined
                ? localization.Forecasting.TransformationCreation
                    .operationInstructions
                : undefined
            }
            options={transformationOperations.map((t) => {
              return { key: t.key, text: t.displayName };
            })}
            selectedKey={this.props.transformationOperation?.key}
            className={classNames.smallDropdown}
            onChange={this.onChangeTransformationOperation}
          />
        </Stack.Item>
        {this.props.transformationOperation && (
          <>
            {isMultiplicationOrDivision(this.props.transformationOperation) && (
              <Stack.Item tokens={{ padding: "36px 0 0 0" }}>
                <Text>
                  {
                    localization.Forecasting.TransformationCreation
                      .divisionAndMultiplicationBy
                  }
                </Text>
              </Stack.Item>
            )}
            <Stack.Item>
              <Label>
                {
                  localization.Forecasting.TransformationCreation
                    .valueSpinButtonHeader
                }
              </Label>
              <SpinButton
                min={this.props.transformationOperation.minValue}
                max={this.props.transformationOperation.maxValue}
                step={this.transformationValueStep}
                value={this.props.transformationValue.toString()}
                className={classNames.smallDropdown}
                onChange={this.onChangeTransformationValue}
              />
              {this.props.transformationValueErrorMessage && (
                <div className={classNames.errorText}>
                  <Text variant={"small"} className={classNames.errorText}>
                    {this.props.transformationValueErrorMessage}
                  </Text>
                </div>
              )}
            </Stack.Item>
          </>
        )}
      </Stack>
    );
  }

  private onChangeTransformationValue = (
    _event: React.SyntheticEvent<HTMLElement>,
    newValue?: string
  ): void => {
    if (newValue) {
      this.props.onChangeTransformationValue(Number(newValue));
    }
  };

  private onChangeTransformationOperation = (
    _event: React.FormEvent<IComboBox>,
    item?: IComboBoxOption
  ): void => {
    if (item) {
      const transformationOperation = transformationOperations.find(
        (op) => op.key === item.key
      );
      if (transformationOperation) {
        this.props.onChangeTransformationOperation(transformationOperation);
      }
    }
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

// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  Stack,
  Text,
  Label,
  ComboBox,
  IComboBox,
  IComboBoxOption,
  TextField
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
  Feature,
  isMultiplicationOrDivision,
  transformationOperations
} from "../Interfaces/Transformation";

export interface ITransformationCreationContinuousProps {
  transformationOperation?: Operation;
  transformationFeature?: Feature;
  transformationValue: string;
  transformationValueErrorMessage?: string;
  onChangeTransformationValue: (newValue: string) => void;
  onChangeTransformationOperation: (operation: Operation) => void;
}

export class TransformationCreationContinuous extends React.Component<ITransformationCreationContinuousProps> {
  public static contextType = ModelAssessmentContext;
  public context: React.ContextType<typeof ModelAssessmentContext> =
    defaultModelAssessmentContext;

  private transformationValueStep = 0.01;

  public render(): React.ReactNode {
    const classNames = forecastingDashboardStyles();

    return (
      <>
        {this.isFeatureSelected() && (
          <Stack.Item>
            <Label>
              {
                localization.Forecasting.TransformationCreation
                  .operationDropdownHeader
              }
            </Label>
            <ComboBox
              id={"ForecastingWhatIfTransformationOperationDropdown"}
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
        )}
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
              <TextField
                id={"ForecastingWhatIfTransformationValueField"}
                type="number"
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
      </>
    );
  }

  private isFeatureSelected = (): boolean => {
    return (
      this.props.transformationFeature !== undefined &&
      this.context !== undefined
    );
  };

  private onChangeTransformationValue = (
    _event: React.SyntheticEvent<HTMLElement>,
    newValue?: string
  ): void => {
    if (newValue !== undefined) {
      this.props.onChangeTransformationValue(newValue);
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
}

// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  Stack,
  Text,
  Label,
  ComboBox,
  IComboBox,
  IComboBoxOption
} from "@fluentui/react";
import {
  defaultModelAssessmentContext,
  ModelAssessmentContext
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import React from "react";

import { forecastingDashboardStyles } from "../ForecastingDashboard.styles";
import { Operation, Feature } from "../Interfaces/Transformation";

export interface ITransformationCreationCategoricalProps {
  transformationOperation?: Operation;
  transformationFeature?: Feature;
  transformationValueErrorMessage?: string;
  onChangeTransformationValue: (newValue: string) => void;
}

export class TransformationCreationCategorical extends React.Component<ITransformationCreationCategoricalProps> {
  public static contextType = ModelAssessmentContext;
  public context: React.ContextType<typeof ModelAssessmentContext> =
    defaultModelAssessmentContext;

  public render(): React.ReactNode {
    const classNames = forecastingDashboardStyles();
    let options = undefined;
    if (this.props.transformationFeature) {
      // find all categorical values for the selected feature
      options = this.context.jointDataset.metaDict[
        this.props.transformationFeature.key
      ].sortedCategoricalValues?.map((value, index) => {
        return {
          key: index.toString(),
          text: value
        };
      });
    }

    return (
      <>
        {this.isFeatureSelected() && (
          <Stack.Item>
            <Stack tokens={{ childrenGap: "4px" }}>
              <Label>
                {
                  localization.Forecasting.TransformationCreation
                    .operationDropdownHeader
                }
              </Label>
              <Text>{localization.Forecasting.Transformations.change}</Text>
            </Stack>
          </Stack.Item>
        )}
        <Stack.Item>
          <Label>
            {
              localization.Forecasting.TransformationCreation
                .valueSpinButtonHeader
            }
          </Label>
          {options && options.length === 1 && <Text>{options[0]}</Text>}
          {options && options.length > 1 && (
            <ComboBox
              defaultSelectedKey={options[0].key.toString()}
              options={options}
              onChange={this.onChangeTransformationValue}
            />
          )}
          {this.props.transformationValueErrorMessage && (
            <div className={classNames.errorText}>
              <Text variant={"small"} className={classNames.errorText}>
                {this.props.transformationValueErrorMessage}
              </Text>
            </div>
          )}
        </Stack.Item>
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
    _event: React.FormEvent<IComboBox>,
    option?: IComboBoxOption | undefined
  ): void => {
    if (option) {
      this.props.onChangeTransformationValue(option.key.toString());
    }
  };
}

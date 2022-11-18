// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  Stack,
  PrimaryButton,
  TextField,
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
// import { localization } from "@responsible-ai/localization";
import React from "react";

import { forecastingDashboardStyles } from "../ForecastingDashboard.styles";
import { ITransformation, IOperation } from "../Interfaces/Transformation";

export interface IForecastCreatorProps {
  addTransformation: (name: string, transformation: ITransformation) => void;
  forecasts: Map<string, ITransformation>;
}

export interface IForecastCreatorState {
  transformationName: string;
  transformationOperation: string;
  transformationFeature: string;
  transformationValue: number;
}

const options: IComboBoxOption[] = Object.keys(IOperation).map((v) => {
  return { key: v, text: v } as IComboBoxOption;
});

const stackTokens = {
  childrenGap: "l1"
};

export class ForecastCreator extends React.Component<
  IForecastCreatorProps,
  IForecastCreatorState
> {
  public static contextType = ModelAssessmentContext;
  public context: React.ContextType<typeof ModelAssessmentContext> =
    defaultModelAssessmentContext;

  private maxTransformationValue = 100;
  public constructor(props: IForecastCreatorProps) {
    super(props);
    this.state = {
      transformationFeature: "",
      transformationName: "",
      transformationOperation: "",
      transformationValue: 0
    };
  }

  public render(): React.ReactNode {
    const classNames = forecastingDashboardStyles();

    let transformationNameErrorMessage = undefined;
    if (this.props.forecasts.has(this.state.transformationName)) {
      transformationNameErrorMessage = "Enter a unique transformation name";
    }
    if (this.state.transformationName === "") {
      transformationNameErrorMessage = "Enter a transformation name";
    }

    return (
      <Stack tokens={stackTokens}>
        {/* <Stack tokens={stackTokens}> */}
        <Stack.Item>
          <Text className={classNames.mediumText}>
            Create What-if Forecasts
          </Text>
        </Stack.Item>
        {/* </Stack> */}
        <Stack.Item>
          <Stack tokens={stackTokens}>
            <Stack.Item>
              <TextField
                label="What-if Forecast Name"
                placeholder="Enter a unique name"
                value={this.state.transformationName}
                onChange={this.onChangeTransformationName}
                className={classNames.smallTextField}
                errorMessage={transformationNameErrorMessage}
              />
            </Stack.Item>
            <Stack.Item className={classNames.transformationBuilder}>
              <Text className={classNames.subMediumText}>
                Transformation function builder
              </Text>
              <Stack horizontal tokens={stackTokens}>
                <Stack.Item>
                  <Label>Choose an Operation</Label>
                  <ComboBox
                    errorMessage={
                      this.state.transformationOperation === ""
                        ? "Choose an operation to apply"
                        : undefined
                    }
                    options={options}
                    selectedKey={this.state.transformationOperation}
                    className={classNames.smallDropdown}
                    onChange={this.onChangeTransformationOperation}
                  />
                </Stack.Item>
                <Stack.Item>
                  <Label>Choose a Feature</Label>
                  <ComboBox
                    errorMessage={
                      this.state.transformationFeature === ""
                        ? "Choose a feature to perturb"
                        : undefined
                    }
                    options={this.context.dataset.feature_names
                      .filter(
                        (_v, idx) =>
                          !this.context.baseErrorCohort.jointDataset.metaDict[
                            `Data${idx}`
                          ].isCategorical &&
                          !this.context.baseErrorCohort.jointDataset.metaDict[
                            `Data${idx}`
                          ].treatAsCategorical
                      )
                      .map((v) => {
                        return { key: v, text: v } as IComboBoxOption;
                      })}
                    selectedKey={this.state.transformationFeature}
                    className={classNames.smallDropdown}
                    onChange={this.onChangeTransformationFeature}
                  />
                </Stack.Item>
                <Stack.Item>
                  <Text>BY</Text>
                </Stack.Item>
                <Stack.Item>
                  <Label>Value</Label>
                  <SpinButton
                    min={0}
                    max={this.maxTransformationValue}
                    step={0.01}
                    value={String(this.state.transformationValue)}
                    className={classNames.smallDropdown}
                    onChange={this.onChangeTransformationValue}
                  />
                </Stack.Item>
              </Stack>
            </Stack.Item>
            <Stack.Item>
              <PrimaryButton
                disabled={
                  this.props.forecasts.has(this.state.transformationName) ||
                  this.state.transformationName === "" ||
                  this.state.transformationFeature === "" ||
                  this.state.transformationOperation === ""
                }
                onClick={this.addTransformation}
                text="Add Transformation"
              />
            </Stack.Item>
          </Stack>
        </Stack.Item>
      </Stack>
    );
  }

  private onChangeTransformationName = (
    _event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>,
    newValue?: string
  ): void => {
    this.setState({ transformationName: newValue || "" });
  };

  private onChangeTransformationValue = (
    _event: React.SyntheticEvent<HTMLElement>,
    newValue?: string
  ): void => {
    this.setState({ transformationValue: Number(newValue) || 0 });
  };

  private onChangeTransformationOperation = (
    _event: React.FormEvent<IComboBox>,
    item?: IComboBoxOption
  ): void => {
    if (item) {
      this.setState({ transformationOperation: (item.key as string) || "" });
    }
  };

  private onChangeTransformationFeature = (
    _event: React.FormEvent<IComboBox>,
    item?: IComboBoxOption
  ): void => {
    if (item) {
      this.setState({ transformationFeature: (item.key as string) || "" });
    }
  };

  private addTransformation = (): void => {
    this.props.addTransformation(this.state.transformationName, {
      cohort: {
        cohortName: this.context.baseErrorCohort.cohort.name,
        compositeFilterList:
          this.context.baseErrorCohort.cohort.compositeFilters,
        filterList: this.context.baseErrorCohort.cohort.filters
      },
      feature: this.state.transformationFeature,
      operation: this.state.transformationOperation,
      value: this.state.transformationValue
    } as ITransformation);
  };
}

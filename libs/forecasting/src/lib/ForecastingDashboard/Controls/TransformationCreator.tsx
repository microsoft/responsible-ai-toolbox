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
  SpinButton,
  Dialog,
  DialogFooter,
  DialogType
} from "@fluentui/react";
import {
  defaultModelAssessmentContext,
  ModelAssessmentContext
} from "@responsible-ai/core-ui";
import React from "react";

import { forecastingDashboardStyles } from "../ForecastingDashboard.styles";
import {
  Transformation,
  Operation,
  transformationOperations,
  Feature,
  isMultiplicationOrDivision
} from "../Interfaces/Transformation";

export interface ITransformationCreatorProps {
  addTransformation: (name: string, transformation: Transformation) => void;
  transformations: Map<string, Transformation>;
  isVisible: boolean;
}

export interface ITransformationCreatorState {
  transformationName?: string;
  transformationOperation?: Operation;
  transformationFeature?: Feature;
  transformationValue: number;
  featureOptions: IComboBoxOption[];
}

function isUndefinedOrEmpty(s: string | undefined) {
  return s === undefined || s === "";
}

export class TransformationCreator extends React.Component<
  ITransformationCreatorProps,
  ITransformationCreatorState
> {
  public static contextType = ModelAssessmentContext;
  public context: React.ContextType<typeof ModelAssessmentContext> =
    defaultModelAssessmentContext;

  private transformationValueStep = 0.01;

  public constructor(props: ITransformationCreatorProps) {
    super(props);
    this.state = { featureOptions: [], transformationValue: 2 };
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

  public componentDidUpdate(
    prevProps: Readonly<ITransformationCreatorProps>
  ): void {
    if (this.props.isVisible !== prevProps.isVisible) {
      this.setState({
        transformationValue: 2,
        transformationOperation: undefined,
        transformationFeature: undefined,
        transformationName: undefined
      });
    }
  }

  public render(): React.ReactNode {
    const classNames = forecastingDashboardStyles();

    let transformationNameErrorMessage = undefined;
    if (isUndefinedOrEmpty(this.state.transformationName)) {
      transformationNameErrorMessage =
        "Enter a name for your what-if scenario.";
    } else if (
      this.state.transformationName &&
      this.props.transformations.has(this.state.transformationName)
    ) {
      transformationNameErrorMessage =
        "This name exists already. Please enter a unique name.";
    }

    let transformationValueErrorMessage = undefined;
    if (
      this.state.transformationOperation &&
      (this.state.transformationValue <
        this.state.transformationOperation.minValue ||
        this.state.transformationValue >
          this.state.transformationOperation.maxValue ||
        this.state.transformationOperation.excludedValues.includes(
          this.state.transformationValue
        ))
    ) {
      transformationValueErrorMessage = `For operation ${
        this.state.transformationOperation.displayName
      } please select a value between ${this.state.transformationOperation.minValue.toString()} and ${this.state.transformationOperation.maxValue.toString()} other than ${this.state.transformationOperation.excludedValues.toString()}.`;
    }

    let transformationCombinationErrorMessage = undefined;
    if (
      this.state.transformationOperation &&
      this.state.transformationFeature
    ) {
      // ensure the current selection isn't a duplicate
      const transformation = this.createTransformation();
      if (transformation) {
        this.props.transformations.forEach((existingTransformation) => {
          const equalsResult = transformation.equals(existingTransformation);
          if (equalsResult) {
            transformationCombinationErrorMessage =
              "This is identical to an existing what-if scenario. Please change the feature, operation, or value.";
          }
        });
      }
    }
    return (
      <Dialog
        hidden={!this.props.isVisible}
        dialogContentProps={{
          type: DialogType.normal,
          title: "Create What-if Forecasts",
          closeButtonAriaLabel: "Close"
        }}
        minWidth={740}
        maxWidth={1000}
      >
        <Stack
          tokens={{
            childrenGap: "l1"
          }}
        >
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
            <Stack
              horizontal
              tokens={{
                childrenGap: "l1"
              }}
            >
              <Stack.Item>
                <Label>Choose a Feature</Label>
                <ComboBox
                  errorMessage={
                    this.state.transformationFeature === undefined
                      ? "Choose a feature to perturb."
                      : undefined
                  }
                  options={this.state.featureOptions}
                  selectedKey={this.state.transformationFeature?.key}
                  className={classNames.smallDropdown}
                  onChange={this.onChangeTransformationFeature}
                />
              </Stack.Item>
              <Stack.Item>
                <Label>Choose an Operation</Label>
                <ComboBox
                  errorMessage={
                    this.state.transformationOperation === undefined
                      ? "Choose an operation to apply to the feature."
                      : undefined
                  }
                  options={transformationOperations.map((t) => {
                    return { key: t.key, text: t.displayName };
                  })}
                  selectedKey={this.state.transformationOperation?.key}
                  className={classNames.smallDropdown}
                  onChange={this.onChangeTransformationOperation}
                />
              </Stack.Item>
              {this.state.transformationOperation && (
                <>
                  {isMultiplicationOrDivision(
                    this.state.transformationOperation
                  ) && (
                    <Stack.Item tokens={{ padding: "36px 0 0 0" }}>
                      <Text>by</Text>
                    </Stack.Item>
                  )}
                  <Stack.Item>
                    <Label>Value</Label>
                    <SpinButton
                      min={this.state.transformationOperation.minValue}
                      max={this.state.transformationOperation.maxValue}
                      step={this.transformationValueStep}
                      value={this.state.transformationValue.toString()}
                      className={classNames.smallDropdown}
                      onChange={this.onChangeTransformationValue}
                    />
                    {transformationValueErrorMessage && (
                      <div className={classNames.errorText}>
                        <Text
                          variant={"small"}
                          className={classNames.errorText}
                        >
                          {transformationValueErrorMessage}
                        </Text>
                      </div>
                    )}
                  </Stack.Item>
                </>
              )}
            </Stack>
          </Stack.Item>
          <Stack.Item>
            {transformationCombinationErrorMessage && (
              <Text variant={"small"} className={classNames.errorText}>
                {transformationCombinationErrorMessage}
              </Text>
            )}
          </Stack.Item>
        </Stack>
        <DialogFooter>
          <PrimaryButton
            disabled={!this.validateTransformation()}
            onClick={this.addTransformation}
            text="Add Transformation"
          />
        </DialogFooter>
      </Dialog>
    );
  }

  private validateTransformation() {
    return (
      !isUndefinedOrEmpty(this.state.transformationName) &&
      this.state.transformationName &&
      !this.props.transformations.has(this.state.transformationName) &&
      this.state.transformationFeature
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
    this.setState({ transformationValue: Number(newValue) });
  };

  private onChangeTransformationOperation = (
    _event: React.FormEvent<IComboBox>,
    item?: IComboBoxOption
  ): void => {
    if (item) {
      const transformationOperation = transformationOperations.find(
        (op) => op.key === item.key
      );
      this.setState({
        transformationOperation
      });
    }
  };

  private onChangeTransformationFeature = (
    _event: React.FormEvent<IComboBox>,
    item?: IComboBoxOption
  ): void => {
    if (item) {
      this.setState({
        transformationFeature: { key: item.key as string, text: item.text }
      });
    }
  };

  private addTransformation = (): void => {
    const transformation = this.createTransformation();
    if (this.state.transformationName && transformation) {
      this.props.addTransformation(
        this.state.transformationName,
        transformation
      );
    }
  };

  private createTransformation(): Transformation | undefined {
    if (
      this.state.transformationFeature &&
      this.state.transformationOperation
    ) {
      return new Transformation(
        this.context.baseErrorCohort,
        this.state.transformationOperation,
        this.state.transformationFeature,
        this.state.transformationValue
      );
    }
    return undefined;
  }
}

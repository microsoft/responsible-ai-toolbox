// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  Stack,
  PrimaryButton,
  TextField,
  Text,
  IComboBoxOption,
  Dialog,
  DialogFooter,
  DialogType
} from "@fluentui/react";
import {
  defaultModelAssessmentContext,
  isUndefinedOrEmpty,
  ModelAssessmentContext
} from "@responsible-ai/core-ui";
import React from "react";

import { forecastingDashboardStyles } from "../ForecastingDashboard.styles";
import {
  Transformation,
  Operation,
  Feature
} from "../Interfaces/Transformation";

import { TransformationCreation } from "./TransformationCreation";

export interface ITransformationCreationDialogProps {
  addTransformation: (name: string, transformation: Transformation) => void;
  transformations: Map<string, Transformation>;
  isVisible: boolean;
}

export interface ITransformationCreationDialogState {
  transformationName?: string;
  transformationOperation?: Operation;
  transformationFeature?: Feature;
  transformationValue: number;
}

export class TransformationCreationDialog extends React.Component<
  ITransformationCreationDialogProps,
  ITransformationCreationDialogState
> {
  public static contextType = ModelAssessmentContext;
  public context: React.ContextType<typeof ModelAssessmentContext> =
    defaultModelAssessmentContext;

  public constructor(props: ITransformationCreationDialogProps) {
    super(props);
    this.state = { transformationValue: 2 };
  }

  public componentDidUpdate(
    prevProps: Readonly<ITransformationCreationDialogProps>
  ): void {
    if (this.props.isVisible !== prevProps.isVisible) {
      this.setState({
        transformationFeature: undefined,
        transformationName: undefined,
        transformationOperation: undefined,
        transformationValue: 2
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
          closeButtonAriaLabel: "Close",
          title: "Create What-if Forecasts",
          type: DialogType.normal
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
            <TransformationCreation
              onChangeTransformationFeature={this.onChangeTransformationFeature}
              onChangeTransformationValue={this.onChangeTransformationValue}
              onChangeTransformationOperation={
                this.onChangeTransformationOperation
              }
              transformationValue={this.state.transformationValue}
              transformationFeature={this.state.transformationFeature}
              transformationName={this.state.transformationName}
              transformationOperation={this.state.transformationOperation}
              transformationValueErrorMessage={transformationValueErrorMessage}
            />
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
            disabled={
              transformationCombinationErrorMessage !== undefined ||
              transformationNameErrorMessage !== undefined ||
              transformationValueErrorMessage !== undefined ||
              this.state.transformationOperation === undefined ||
              this.state.transformationFeature === undefined
            }
            onClick={this.addTransformation}
            text="Add Transformation"
          />
        </DialogFooter>
      </Dialog>
    );
  }

  private onChangeTransformationName = (
    _event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>,
    newValue?: string
  ): void => {
    this.setState({ transformationName: newValue || "" });
  };

  private onChangeTransformationValue = (newValue: number): void => {
    this.setState({ transformationValue: newValue });
  };

  private onChangeTransformationOperation = (operation: Operation): void => {
    this.setState({
      transformationOperation: operation
    });
  };

  private onChangeTransformationFeature = (item: IComboBoxOption): void => {
    this.setState({
      transformationFeature: { key: item.key as string, text: item.text }
    });
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

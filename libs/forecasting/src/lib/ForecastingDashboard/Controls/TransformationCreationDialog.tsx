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
  isNumber,
  mayBecomeNumber,
  ModelAssessmentContext
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import React from "react";

import { forecastingDashboardStyles } from "../ForecastingDashboard.styles";
import {
  Transformation,
  Operation,
  Feature
} from "../Interfaces/Transformation";

import { isValidTransformationName } from "./isValidTransformationName";
import { TransformationCreation } from "./TransformationCreation";

export interface ITransformationCreationDialogProps {
  addTransformation: (name: string, transformation: Transformation) => void;
  transformations: Map<string, Transformation>;
  isVisible: boolean;
  onDismiss: () => void;
}

export interface ITransformationCreationDialogState {
  transformationName?: string;
  transformationOperation?: Operation;
  transformationFeature?: Feature;
  transformationValue: string;
}

const transformationDefaultValue = "0";
const transformationNameMaxLength = 50;

export class TransformationCreationDialog extends React.Component<
  ITransformationCreationDialogProps,
  ITransformationCreationDialogState
> {
  public static contextType = ModelAssessmentContext;
  public context: React.ContextType<typeof ModelAssessmentContext> =
    defaultModelAssessmentContext;

  public constructor(props: ITransformationCreationDialogProps) {
    super(props);
    this.state = { transformationValue: transformationDefaultValue };
  }

  public componentDidUpdate(
    prevProps: Readonly<ITransformationCreationDialogProps>
  ): void {
    if (this.props.isVisible !== prevProps.isVisible) {
      this.setState({
        transformationFeature: undefined,
        transformationName: undefined,
        transformationOperation: undefined,
        transformationValue: transformationDefaultValue
      });
    }
  }

  public render(): React.ReactNode {
    const classNames = forecastingDashboardStyles();

    const transformationValueErrorMessage =
      this.getTransformationValueErrorMessage();

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
              localization.Forecasting.TransformationCreation
                .invalidCombinationErrorMessage;
          }
        });
      }
    }
    return (
      <Dialog
        hidden={!this.props.isVisible}
        dialogContentProps={{
          closeButtonAriaLabel: "Close",
          title: localization.Forecasting.TransformationCreation.title,
          type: DialogType.normal
        }}
        modalProps={{
          isBlocking: true
        }}
        minWidth={740}
        maxWidth={1000}
        onDismiss={this.props.onDismiss}
      >
        <Stack
          tokens={{
            childrenGap: "l1"
          }}
        >
          <Stack.Item>
            <TextField
              id={"ForecastingWhatIfTransformationNameField"}
              label={localization.Forecasting.TransformationCreation.nameLabel}
              placeholder={
                localization.Forecasting.TransformationCreation
                  .scenarioNamingInstructionsPlaceholder
              }
              value={this.state.transformationName}
              onChange={this.onChangeTransformationName}
              className={classNames.smallTextField}
              onGetErrorMessage={this.getTransformationNameErrorMessage}
              validateOnLoad={false}
            />
          </Stack.Item>
          <Stack.Item>
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
            id={"ForecastingWhatIfAddTransformationButton"}
            disabled={
              transformationCombinationErrorMessage !== undefined ||
              this.getTransformationNameErrorMessage(
                this.state.transformationName
              ) !== undefined ||
              transformationValueErrorMessage !== undefined ||
              this.state.transformationOperation === undefined ||
              this.state.transformationFeature === undefined
            }
            onClick={this.addTransformation}
            text={
              localization.Forecasting.TransformationCreation
                .addTransformationButton
            }
          />
        </DialogFooter>
      </Dialog>
    );
  }

  private getTransformationValueErrorMessage(
    value?: string
  ): string | undefined {
    if (!value) {
      value = this.state.transformationValue;
    }
    if (
      this.state.transformationOperation &&
      this.state.transformationFeature &&
      this.context
    ) {
      const featureMeta =
        this.context.jointDataset.metaDict[
          this.state.transformationFeature.key
        ];
      if (featureMeta.isCategorical || featureMeta.treatAsCategorical) {
        return undefined;
      }

      let valueIsNotANumber = false;
      let valueExcluded = false;
      if (isNumber(value)) {
        const transformationValue = Number(value);
        valueExcluded =
          this.state.transformationOperation.excludedValues.includes(
            transformationValue
          );
      } else {
        valueIsNotANumber = true;
      }

      if (valueIsNotANumber || valueExcluded) {
        return localization.formatString(
          localization.Forecasting.TransformationCreation.valueErrorMessage,
          this.state.transformationOperation.displayName,
          this.state.transformationOperation.excludedValues.toString()
        );
      }
    }
    return undefined;
  }

  private getTransformationNameErrorMessage = (
    value?: string
  ): string | undefined => {
    value = value ?? "";
    if (value.length === 0) {
      return localization.Forecasting.TransformationCreation
        .scenarioNamingInstructions;
    }
    if (this.props.transformations.has(value)) {
      return localization.Forecasting.TransformationCreation
        .scenarioNamingCollisionMessage;
    }
    if (value.length > transformationNameMaxLength) {
      return localization.formatString(
        localization.Forecasting.TransformationCreation
          .scenarioNamingLengthMessage,
        value.length
      );
    }
    if (!isValidTransformationName(value)) {
      return localization.Forecasting.TransformationCreation
        .scenarioNamingInvalidCharactersMessage;
    }

    return undefined;
  };

  private onChangeTransformationName = (
    _event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>,
    newValue?: string
  ): void => {
    if (this.state.transformationName !== newValue) {
      this.setState({ transformationName: newValue || "" });
    }
  };

  private onChangeTransformationValue = (newValue: string): void => {
    if (
      this.getTransformationValueErrorMessage(newValue) === undefined ||
      mayBecomeNumber(newValue)
    ) {
      this.setState({ transformationValue: newValue });
    }
  };

  private onChangeTransformationOperation = (operation: Operation): void => {
    this.setState({
      transformationOperation: operation
    });
  };

  private onChangeTransformationFeature = (item: IComboBoxOption): void => {
    const featureMetaName = item.key;
    const featureMeta = this.context.jointDataset.metaDict[featureMetaName];
    // with categorical features the operation is always "change"
    if (featureMeta.isCategorical || featureMeta.treatAsCategorical) {
      this.setState({
        transformationFeature: { key: item.key as string, text: item.text },
        transformationOperation: {
          displayName: localization.Forecasting.Transformations.change,
          excludedValues: [],
          key: "change"
        } as Operation
      });
      return;
    }
    this.setState({
      transformationFeature: { key: item.key as string, text: item.text },
      transformationOperation: undefined,
      transformationValue: transformationDefaultValue
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
      this.state.transformationOperation &&
      isNumber(this.state.transformationValue)
    ) {
      return new Transformation(
        this.context.baseErrorCohort,
        this.state.transformationOperation,
        this.state.transformationFeature,
        Number(this.state.transformationValue)
      );
    }
    return undefined;
  }
}

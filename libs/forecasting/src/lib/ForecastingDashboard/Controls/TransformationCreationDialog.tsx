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
  transformationValue: number;
}

const transformationDefaultValue = 2;

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

    let transformationNameErrorMessage = undefined;
    if (!this.state.transformationName) {
      transformationNameErrorMessage =
        localization.Forecasting.TransformationCreation
          .scenarioNamingInstructions;
    } else if (
      this.state.transformationName &&
      this.props.transformations.has(this.state.transformationName)
    ) {
      transformationNameErrorMessage =
        localization.Forecasting.TransformationCreation
          .scenarioNamingCollisionMessage;
    }

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
              label={localization.Forecasting.TransformationCreation.nameLabel}
              placeholder={
                localization.Forecasting.TransformationCreation
                  .scenarioNamingInstructionsPlaceholder
              }
              value={this.state.transformationName}
              onChange={this.onChangeTransformationName}
              className={classNames.smallTextField}
              errorMessage={transformationNameErrorMessage}
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
            disabled={
              transformationCombinationErrorMessage !== undefined ||
              transformationNameErrorMessage !== undefined ||
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

  getTransformationValueErrorMessage() {
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
      if (
        this.state.transformationValue <
          this.state.transformationOperation.minValue ||
        this.state.transformationValue >
          this.state.transformationOperation.maxValue ||
        this.state.transformationOperation.excludedValues.includes(
          this.state.transformationValue
        )
      ) {
        return localization.formatString(
          localization.Forecasting.TransformationCreation.valueErrorMessage,
          this.state.transformationOperation.displayName,
          this.state.transformationOperation.minValue,
          this.state.transformationOperation.maxValue,
          this.state.transformationOperation.excludedValues.toString()
        );
      }
    }
    return undefined;
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
    const featureMetaName = item.key;
    const featureMeta = this.context.jointDataset.metaDict[featureMetaName];
    // with categorical features the operation is always "change"
    if (featureMeta.isCategorical || featureMeta.treatAsCategorical) {
      this.setState({
        transformationFeature: { key: item.key as string, text: item.text },
        transformationOperation: {
          displayName: localization.Forecasting.Transformations.change,
          excludedValues: [],
          key: "change",
          maxValue: 0,
          minValue: 0
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

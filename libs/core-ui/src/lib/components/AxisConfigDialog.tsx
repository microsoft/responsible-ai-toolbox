// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IComboBoxOption,
  IComboBox,
  ComboBox,
  Text,
  PrimaryButton,
  Panel,
  Stack,
  DefaultButton
} from "@fluentui/react";
import { localization } from "@responsible-ai/localization";
import React from "react";

import { cohortKey } from "../cohortKey";
import {
  ModelAssessmentContext,
  defaultModelAssessmentContext
} from "../Context/ModelAssessmentContext";
import { AxisTypes, ISelectorConfig } from "../util/IGenericChartProps";
import { TelemetryLevels } from "../util/ITelemetryEvent";
import { JointDataset } from "../util/JointDataset";
import { ColumnCategories } from "../util/JointDatasetUtils";
import { TelemetryEventName } from "../util/TelemetryEventName";

import { AxisConfigBinOptions } from "./AxisConfigBinOptions";
import { AxisConfigChoiceGroup } from "./AxisConfigChoiceGroup";
import { IAxisConfigDialogProps } from "./AxisConfigDialogProps";
import {
  buildAxisConfigDialogState,
  IAxisConfigDialogState
} from "./AxisConfigDialogState";
import { getBinCountForProperty } from "./AxisConfigDialogUtils";

export class AxisConfigDialog extends React.PureComponent<
  IAxisConfigDialogProps,
  IAxisConfigDialogState
> {
  public static contextType = ModelAssessmentContext;
  private static readonly MIN_HIST_COLS = 2;
  private static readonly MAX_HIST_COLS = 40;
  private static readonly DEFAULT_BIN_COUNT = 5;

  public context: React.ContextType<typeof ModelAssessmentContext> =
    defaultModelAssessmentContext;

  public componentDidMount(): void {
    const droppedFeatureSet = new Set(
      this.context.jointDataset.datasetMetaData?.featureMetaData?.dropped_features
    );
    this.setState(
      buildAxisConfigDialogState(
        this.context.jointDataset,
        this.props,
        AxisConfigDialog.DEFAULT_BIN_COUNT,
        droppedFeatureSet
      )
    );
  }

  public render(): React.ReactNode {
    if (!this.state) {
      return React.Fragment;
    }
    const isDataColumn = this.state.selectedColumn.property.includes(
      JointDataset.DataLabelRoot
    );
    const isProbabilityColumn = this.state.selectedColumn.property.includes(
      JointDataset.ProbabilityYRoot
    );
    const isMultilabel = this.context.jointDataset.numLabels > 1;
    const isMultilablePredictedYColumn =
      isMultilabel &&
      this.state.selectedColumn.property.includes(JointDataset.PredictedYLabel);
    const isMultilableTrueYColumn =
      isMultilabel &&
      this.state.selectedColumn.property.includes(JointDataset.TrueYLabel);
    return (
      <Panel
        id="AxisConfigPanel"
        onDismiss={this.props.onCancel}
        isOpen
        onRenderFooter={this.renderFooter}
        isFooterAtBottom
        isLightDismiss
        closeButtonAriaLabel={localization.Common.close}
      >
        <Stack tokens={{ childrenGap: "l1" }}>
          <Stack.Item>
            <AxisConfigChoiceGroup
              {...this.props}
              jointDataset={this.context.jointDataset}
              defaultBinCount={AxisConfigDialog.DEFAULT_BIN_COUNT}
              selectedFilterGroup={this.state.selectedFilterGroup}
              onBinCountUpdated={this.onBinCountUpdated}
              onSelectedColumnUpdated={this.onSelectedColumnUpdated}
              onSelectedFilterGroupUpdated={this.onSelectedFilterGroupUpdated}
            />
          </Stack.Item>
          {this.state.selectedColumn.property === cohortKey && (
            <Stack.Item>
              <Text>
                {localization.Interpret.AxisConfigDialog.groupByCohort}
              </Text>
            </Stack.Item>
          )}
          {this.state.selectedColumn.property === ColumnCategories.None && (
            <Stack.Item>
              <Text>
                {localization.Interpret.AxisConfigDialog.countHelperText}
              </Text>
            </Stack.Item>
          )}
          {this.state.selectedColumn.property !== cohortKey &&
            this.state.selectedColumn.property !== ColumnCategories.None && (
              <Stack>
                {isDataColumn &&
                  this.renderComboBox(
                    this.state.dataArray,
                    localization.Interpret.AxisConfigDialog.selectFeature
                  )}
                {isProbabilityColumn &&
                  this.renderClassComboBox(this.state.classArray)}
                {isMultilablePredictedYColumn &&
                  this.renderClassComboBox(
                    this.state.multilabelPredictedYArray
                  )}
                {isMultilableTrueYColumn &&
                  this.renderClassComboBox(this.state.multilabelTrueYArray)}
                <AxisConfigBinOptions
                  {...this.props}
                  jointDataset={this.context.jointDataset}
                  defaultBinCount={AxisConfigDialog.DEFAULT_BIN_COUNT}
                  maxHistCols={AxisConfigDialog.MAX_HIST_COLS}
                  minHistCols={AxisConfigDialog.MIN_HIST_COLS}
                  selectedBinCount={this.state.binCount}
                  selectedColumn={this.state.selectedColumn}
                  onBinCountUpdated={this.onBinCountUpdated}
                  onEnableLogarithmicScaling={this.enableLogarithmicScaling}
                  onSelectedColumnUpdated={this.onSelectedColumnUpdated}
                  onSetAsCategorical={this.setAsCategorical}
                />
              </Stack>
            )}
        </Stack>
      </Panel>
    );
  }

  private renderFooter = (): JSX.Element => {
    return (
      <Stack horizontal tokens={{ childrenGap: "l1", padding: "l1" }}>
        <PrimaryButton
          onClick={this.saveState}
          ariaLabel={localization.Core.ShiftCohort.applyAriaLabel}
        >
          {localization.Interpret.AxisConfigDialog.apply}
        </PrimaryButton>
        <DefaultButton
          onClick={this.props.onCancel}
          ariaLabel={localization.Interpret.CohortEditor.cancelAriaLabel}
        >
          {localization.Interpret.CohortEditor.cancel}
        </DefaultButton>
      </Stack>
    );
  };

  private renderComboBox = (
    options: IComboBoxOption[],
    label: string
  ): JSX.Element => {
    return (
      <ComboBox
        options={options}
        onChange={this.setSelectedProperty}
        label={label}
        selectedKey={this.state.selectedColumn.property}
      />
    );
  };

  private renderClassComboBox = (options: IComboBoxOption[]): JSX.Element => {
    return this.renderComboBox(
      options,
      localization.Interpret.AxisConfigDialog.selectClass
    );
  };

  private onSelectedColumnUpdated = (selectedColumn: ISelectorConfig): void => {
    this.setState({ selectedColumn });
  };

  private onBinCountUpdated = (binCount?: number): void => {
    this.setState({ binCount });
  };

  private onSelectedFilterGroupUpdated = (
    selectedFilterGroup?: string
  ): void => {
    this.setState({ selectedFilterGroup });
  };

  private readonly setAsCategorical = (checked?: boolean): void => {
    if (checked === undefined) {
      return;
    }
    this.context.jointDataset.setTreatAsCategorical(
      this.state.selectedColumn.property,
      checked
    );
    this.setState({
      binCount: checked ? undefined : AxisConfigDialog.MIN_HIST_COLS
    });
    this.forceUpdate();
  };

  private readonly enableLogarithmicScaling = (checked?: boolean): void => {
    if (checked === undefined) {
      return;
    }
    this.context.jointDataset.setLogarithmicScaling(
      this.state.selectedColumn.property,
      checked
    );

    this.setState({
      selectedColumn: {
        ...this.state.selectedColumn,
        type: checked ? AxisTypes.Logarithmic : undefined
      }
    });
  };

  private readonly saveState = (): void => {
    if (this.state.binCount) {
      this.context.jointDataset.addBin(
        this.state.selectedColumn.property,
        this.state.binCount
      );
    }
    this.props.onAccept(this.state.selectedColumn);
    this.props.onCancel();
    this.context.telemetryHook?.({
      level: TelemetryLevels.ButtonClick,
      type: TelemetryEventName.NewAxisConfigSelected
    });
  };

  private setDefaultStateForKey(property: string): void {
    const dither =
      this.props.canDither &&
      this.context.jointDataset.metaDict[property]?.treatAsCategorical;
    const binCount = getBinCountForProperty(
      this.context.jointDataset.metaDict[property],
      this.props.canBin,
      AxisConfigDialog.DEFAULT_BIN_COUNT
    );
    this.setState({
      binCount,
      selectedColumn: {
        options: {
          dither
        },
        property,
        type: this.context.jointDataset.metaDict[property]?.AxisType
      }
    });
  }

  private readonly setSelectedProperty = (
    _event: React.FormEvent<IComboBox>,
    item?: IComboBoxOption
  ): void => {
    if (typeof item?.key === "string") {
      const property = item.key;
      this.setDefaultStateForKey(property);
    }
  };
}

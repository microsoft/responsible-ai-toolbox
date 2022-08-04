// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  Checkbox,
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
import { RangeTypes } from "@responsible-ai/mlchartlib";
import _ from "lodash";
import React from "react";

import { cohortKey } from "../cohortKey";
import { ISelectorConfig } from "../util/IGenericChartProps";
import { ITelemetryEvent, TelemetryLevels } from "../util/ITelemetryEvent";
import { ColumnCategories, JointDataset } from "../util/JointDataset";
import { TelemetryEventName } from "../util/TelemetryEventName";

import { AxisConfigBinOptions } from "./AxisConfigBinOptions";
import { AxisConfigChoiceGroup } from "./AxisConfigChoiceGroup";
import {
  allowUserInteract,
  extractSelectionKey,
  getBinCountForProperty
} from "./AxisConfigDialogUtils";

export interface IAxisConfigProps {
  jointDataset: JointDataset;
  orderedGroupTitles: ColumnCategories[];
  selectedColumn: ISelectorConfig;
  canBin: boolean;
  mustBin: boolean;
  canDither: boolean;
  onAccept: (newConfig: ISelectorConfig) => void;
  onCancel: () => void;
  telemetryHook?: (message: ITelemetryEvent) => void;
}

export interface IAxisConfigState {
  selectedColumn: ISelectorConfig;
  binCount?: number;
  selectedFilterGroup?: string;
}

export class AxisConfigDialog extends React.PureComponent<
  IAxisConfigProps,
  IAxisConfigState
> {
  private static readonly MIN_HIST_COLS = 2;
  private static readonly MAX_HIST_COLS = 40;
  private static readonly DEFAULT_BIN_COUNT = 5;

  private readonly dataArray: IComboBoxOption[] = new Array(
    this.props.jointDataset.datasetFeatureCount
  )
    .fill(0)
    .map((_, index) => {
      const key = JointDataset.DataLabelRoot + index.toString();
      return {
        key,
        text: this.props.jointDataset.metaDict[key].abbridgedLabel
      };
    });
  private readonly classArray: IComboBoxOption[] = new Array(
    this.props.jointDataset.predictionClassCount
  )
    .fill(0)
    .map((_, index) => {
      const key = JointDataset.ProbabilityYRoot + index.toString();
      return {
        key,
        text: this.props.jointDataset.metaDict[key].abbridgedLabel
      };
    });
  public constructor(props: IAxisConfigProps) {
    super(props);
    this.state = {
      binCount: getBinCountForProperty(
        this.props.jointDataset.metaDict[this.props.selectedColumn.property],
        this.props.canBin,
        AxisConfigDialog.DEFAULT_BIN_COUNT
      ),
      selectedColumn: _.cloneDeep(this.props.selectedColumn),
      selectedFilterGroup: extractSelectionKey(
        this.props.selectedColumn.property
      )
    };
  }

  public render(): React.ReactNode {
    const selectedMeta =
      this.props.jointDataset.metaDict[this.state.selectedColumn.property];
    const isDataColumn = this.state.selectedColumn.property.includes(
      JointDataset.DataLabelRoot
    );
    const isProbabilityColumn = this.state.selectedColumn.property.includes(
      JointDataset.ProbabilityYRoot
    );

    return (
      <Panel
        id="AxisConfigPanel"
        onDismiss={this.props.onCancel}
        isOpen
        onRenderFooter={this.renderFooter}
        isFooterAtBottom
        isLightDismiss
      >
        <Stack tokens={{ childrenGap: "l1" }}>
          <Stack.Item>
            <AxisConfigChoiceGroup
              {...this.props}
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
                {isDataColumn && (
                  <ComboBox
                    options={this.dataArray}
                    onChange={this.setSelectedProperty}
                    label={
                      localization.Interpret.AxisConfigDialog.selectFeature
                    }
                    selectedKey={this.state.selectedColumn.property}
                  />
                )}
                {isProbabilityColumn && (
                  <ComboBox
                    options={this.classArray}
                    onChange={this.setSelectedProperty}
                    label={localization.Interpret.AxisConfigDialog.selectClass}
                    selectedKey={this.state.selectedColumn.property}
                  />
                )}
                {selectedMeta.featureRange?.rangeType === RangeTypes.Integer &&
                  allowUserInteract(this.state.selectedColumn.property) && (
                    <Checkbox
                      key={this.state.selectedColumn.property}
                      label={
                        localization.Interpret.AxisConfigDialog
                          .TreatAsCategorical
                      }
                      checked={selectedMeta.treatAsCategorical}
                      onChange={this.setAsCategorical}
                    />
                  )}
                <AxisConfigBinOptions
                  {...this.props}
                  defaultBinCount={AxisConfigDialog.DEFAULT_BIN_COUNT}
                  maxHistCols={AxisConfigDialog.MAX_HIST_COLS}
                  minHistCols={AxisConfigDialog.MIN_HIST_COLS}
                  selectedBinCount={this.state.binCount}
                  selectedColumn={this.state.selectedColumn}
                  onBinCountUpdated={this.onBinCountUpdated}
                  onSelectedColumnUpdated={this.onSelectedColumnUpdated}
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
        <PrimaryButton onClick={this.saveState}>
          {localization.Interpret.AxisConfigDialog.apply}
        </PrimaryButton>
        <DefaultButton onClick={this.props.onCancel}>
          {localization.Interpret.CohortEditor.cancel}
        </DefaultButton>
      </Stack>
    );
  };

  private onSelectedColumnUpdated = (selectedColumn: ISelectorConfig) => {
    this.setState({ selectedColumn });
  };

  private onBinCountUpdated = (binCount?: number) => {
    this.setState({ binCount });
  };

  private onSelectedFilterGroupUpdated = (selectedFilterGroup?: string) => {
    this.setState({ selectedFilterGroup });
  };

  private readonly setAsCategorical = (
    _ev?: React.FormEvent<HTMLElement>,
    checked?: boolean
  ): void => {
    if (checked === undefined) {
      return;
    }
    this.props.jointDataset.setTreatAsCategorical(
      this.state.selectedColumn.property,
      checked
    );
    this.setState({
      binCount: checked ? undefined : AxisConfigDialog.MIN_HIST_COLS
    });
    this.forceUpdate();
  };

  private readonly saveState = (): void => {
    if (this.state.binCount) {
      this.props.jointDataset.addBin(
        this.state.selectedColumn.property,
        this.state.binCount
      );
    }
    this.props.onAccept(this.state.selectedColumn);
    this.props.telemetryHook?.({
      level: TelemetryLevels.ButtonClick,
      type: TelemetryEventName.NewAxisConfigSelected
    });
  };

  private setDefaultStateForKey(property: string): void {
    const dither =
      this.props.canDither &&
      this.props.jointDataset.metaDict[property]?.treatAsCategorical;
    const binCount = getBinCountForProperty(
      this.props.jointDataset.metaDict[property],
      this.props.canBin,
      AxisConfigDialog.DEFAULT_BIN_COUNT
    );
    this.setState({
      binCount,
      selectedColumn: {
        options: {
          dither
        },
        property
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

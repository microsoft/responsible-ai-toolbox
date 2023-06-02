// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IComboBoxOption,
  IComboBox,
  ComboBox,
  PrimaryButton,
  Stack,
  DefaultButton
} from "@fluentui/react";
import {
  defaultModelAssessmentContext,
  ModelAssessmentContext,
  FluentUIStyles,
  InteractiveLegend,
  ICounterfactualData,
  ITelemetryEvent,
  TelemetryLevels,
  TelemetryEventName,
  DatasetTaskType,
  ifEnableLargeData,
  JointDataset
} from "@responsible-ai/core-ui";
import { WhatIfConstants } from "@responsible-ai/interpret";
import { localization } from "@responsible-ai/localization";
import React from "react";

import { getCurrentLabel } from "../util/getCurrentLabel";

import { counterfactualChartStyles } from "./CounterfactualChart.styles";

export interface ICounterfactualChartLegendProps {
  customPointIsActive: boolean[];
  customPoints: Array<{
    [key: string]: any;
  }>;
  data: ICounterfactualData;
  selectedPointsIndexes: number[];
  indexSeries: number[];
  isCounterfactualsDataLoading?: boolean;
  isBubbleChartRendered?: boolean;
  removeCustomPoint: (index: number) => void;
  setTemporaryPointToCopyOfDatasetPoint: (
    index: number,
    absoluteIndex?: number
  ) => void;
  setCounterfactualData?: (absoluteIndex?: number) => Promise<void>;
  telemetryHook?: (message: ITelemetryEvent) => void;
  toggleCustomActivation: (index: number) => void;
  togglePanel: () => void;
  toggleSelectionOfPoint: (index?: number) => number[];
  setIsRevertButtonClicked: (status: boolean) => void;
}

export class CounterfactualChartLegend extends React.PureComponent<ICounterfactualChartLegendProps> {
  public static contextType = ModelAssessmentContext;
  public context: React.ContextType<typeof ModelAssessmentContext> =
    defaultModelAssessmentContext;

  public render(): React.ReactNode {
    const classNames = counterfactualChartStyles();
    return (
      <Stack className={classNames.legendAndText}>
        {this.displayComboBox() && (
          <ComboBox
            id={"CounterfactualSelectedDatapoint"}
            className={classNames.legendLabel}
            label={localization.Counterfactuals.selectedDatapoint}
            onChange={this.selectPointFromDropdown}
            options={this.getDataOptions()}
            selectedKey={`${this.props.selectedPointsIndexes[0]}`}
            ariaLabel={"datapoint picker"}
            useComboBoxAsMenuWidth
            styles={FluentUIStyles.smallDropdownStyle}
            disabled={this.props.isCounterfactualsDataLoading}
          />
        )}
        <div className={classNames.legendLabel}>
          <b>{`${this.getTargetDescription()}: `}</b>
          {getCurrentLabel(
            this.context.dataset.task_type,
            this.props.data?.desired_range,
            this.props.data?.desired_class
          )}
        </div>
        <PrimaryButton
          className={classNames.buttonStyle}
          onClick={this.props.togglePanel}
          disabled={this.disableCounterfactualPanel()}
          text={
            this.context.requestPredictions
              ? localization.Counterfactuals.createWhatIfCounterfactual
              : localization.Counterfactuals.createCounterfactual
          }
        />
        {this.displayRevertButton() && (
          <DefaultButton
            className={classNames.buttonStyle}
            onClick={this.onRevertButtonClick}
            text={localization.Counterfactuals.revertToBubbleChart}
            title={localization.Counterfactuals.revertToBubbleChart}
            disabled={this.props.isCounterfactualsDataLoading}
          />
        )}
        {this.props.customPoints.length > 0 && (
          <InteractiveLegend
            items={this.props.customPoints.map((row, rowIndex) => {
              return {
                activated: this.props.customPointIsActive[rowIndex],
                color:
                  FluentUIStyles.fluentUIColorPalette[
                    rowIndex + WhatIfConstants.MAX_SELECTION + 1
                  ],
                index: rowIndex,
                name: row[WhatIfConstants.namePath],
                onClick: this.props.toggleCustomActivation,
                onDelete: this.props.removeCustomPoint
              };
            })}
          />
        )}
      </Stack>
    );
  }

  private getTargetDescription(): string {
    if (this.context.dataset.task_type === DatasetTaskType.Regression) {
      return localization.Counterfactuals.currentRange;
    }
    return localization.Counterfactuals.currentClass;
  }

  private displayComboBox(): boolean {
    const isLargeDataEnabled = ifEnableLargeData(this.context.dataset);
    if (!isLargeDataEnabled) {
      return true;
    }

    return isLargeDataEnabled && this.props.indexSeries.length > 0;
  }

  private displayRevertButton(): boolean {
    return (
      ifEnableLargeData(this.context.dataset) &&
      this.props.indexSeries.length > 0
    );
  }

  private selectPointFromDropdown = (
    _event: React.FormEvent<IComboBox>,
    item?: IComboBoxOption
  ): void => {
    if (typeof item?.key === "string") {
      const index = Number.parseInt(item.key);
      this.props.setTemporaryPointToCopyOfDatasetPoint(index, item.data.index);
      const newSelections = this.props.toggleSelectionOfPoint(index);
      if (
        ifEnableLargeData(this.context.dataset) &&
        this.props.setCounterfactualData &&
        newSelections.length > 0
      ) {
        this.props.setCounterfactualData(item.data.index);
      }
      this.logTelemetryEvent(
        TelemetryEventName.CounterfactualNewDatapointSelectedFromDropdown
      );
    }
  };

  private disableCounterfactualPanel = (): boolean => {
    const counterfactualsList = ifEnableLargeData(this.context.dataset)
      ? this.props.data.cfs_list
      : this.props.data.cfs_list[this.props.selectedPointsIndexes[0]];
    return (
      this.props.selectedPointsIndexes[0] === undefined ||
      !counterfactualsList ||
      !!this.props.isCounterfactualsDataLoading
    );
  };

  private onRevertButtonClick = (): void => {
    this.props.telemetryHook?.({
      level: TelemetryLevels.ButtonClick,
      type: TelemetryEventName.ViewBubblePlotButtonClicked
    });
    this.props.setIsRevertButtonClicked(true);
  };

  private getDataOptions(): IComboBoxOption[] {
    let indexes = this.context.selectedErrorCohort.cohort.unwrap(
      JointDataset.IndexLabel
    );
    indexes.sort((a, b) => Number.parseInt(a) - Number.parseInt(b));
    const isLargeDataEnabled = ifEnableLargeData(this.context.dataset);
    if (isLargeDataEnabled) {
      indexes = this.props.indexSeries;
    }

    return indexes.map((ind, i) => {
      const index = isLargeDataEnabled ? i : ind;
      return {
        data: { index: indexes[i] },
        key: `${index}`,
        text: `Index ${index}`
      };
    });
  }

  private logTelemetryEvent = (eventName: TelemetryEventName): void => {
    this.props.telemetryHook?.({
      level: TelemetryLevels.ButtonClick,
      type: eventName
    });
  };
}

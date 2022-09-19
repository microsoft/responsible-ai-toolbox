// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IComboBoxOption,
  IComboBox,
  ComboBox,
  PrimaryButton,
  Stack
} from "@fluentui/react";
import {
  JointDataset,
  defaultModelAssessmentContext,
  ModelAssessmentContext,
  FluentUIStyles,
  InteractiveLegend,
  ICounterfactualData,
  ITelemetryEvent,
  TelemetryLevels,
  TelemetryEventName,
  DatasetTaskType
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
  removeCustomPoint: (index: number) => void;
  setTemporaryPointToCopyOfDatasetPoint: (index: number) => void;
  telemetryHook?: (message: ITelemetryEvent) => void;
  toggleCustomActivation: (index: number) => void;
  togglePanel: () => void;
  toggleSelectionOfPoint: (index?: number) => void;
}

export class CounterfactualChartLegend extends React.PureComponent<ICounterfactualChartLegendProps> {
  public static contextType = ModelAssessmentContext;
  public context: React.ContextType<typeof ModelAssessmentContext> =
    defaultModelAssessmentContext;

  public render(): React.ReactNode {
    const classNames = counterfactualChartStyles();
    return (
      <Stack className={classNames.legendAndText}>
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
        />
        <div className={classNames.legendLabel}>
          <b>{`${this.getTargetDescription()}: `}</b>
          {getCurrentLabel(
            this.context.dataset.task_type,
            this.props.data.desired_range,
            this.props.data.desired_class
          )}
        </div>
        <PrimaryButton
          className={classNames.legendLabel}
          onClick={this.props.togglePanel}
          disabled={this.disableCounterfactualPanel()}
          text={
            this.context.requestPredictions
              ? localization.Counterfactuals.createWhatIfCounterfactual
              : localization.Counterfactuals.createCounterfactual
          }
        />
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

  private selectPointFromDropdown = (
    _event: React.FormEvent<IComboBox>,
    item?: IComboBoxOption
  ): void => {
    if (typeof item?.key === "string") {
      const index = Number.parseInt(item.key);
      this.props.setTemporaryPointToCopyOfDatasetPoint(index);
      this.props.toggleSelectionOfPoint(index);
      this.logTelemetryEvent(
        TelemetryEventName.CounterfactualNewDatapointSelectedFromDropdown
      );
    }
  };

  private disableCounterfactualPanel = (): boolean => {
    return (
      this.props.selectedPointsIndexes[0] === undefined ||
      !this.props.data.cfs_list[this.props.selectedPointsIndexes[0]]
    );
  };

  private getDataOptions(): IComboBoxOption[] {
    const indexes = this.context.selectedErrorCohort.cohort.unwrap(
      JointDataset.IndexLabel
    );
    indexes.sort((a, b) => Number.parseInt(a) - Number.parseInt(b));
    return indexes.map((index) => {
      return {
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

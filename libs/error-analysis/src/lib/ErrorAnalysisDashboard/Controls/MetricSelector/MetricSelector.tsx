// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Dropdown, IDropdownOption, IDropdownStyles } from "@fluentui/react";
import {
  Metrics,
  ModelTypes,
  ModelAssessmentContext,
  defaultModelAssessmentContext,
  IsBinary,
  IsMulticlass,
  IsMultilabel,
  ITelemetryEvent,
  TelemetryLevels,
  TelemetryEventName
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import React from "react";

import { MetricLocalizationType, MetricUtils } from "../../MetricUtils";

export interface IMetricSelectorProps {
  isEnabled: boolean;
  setMetric: (metric: string) => void;
  telemetryHook?: (message: ITelemetryEvent) => void;
}

export class MetricSelector extends React.Component<IMetricSelectorProps> {
  public static contextType = ModelAssessmentContext;
  public context: React.ContextType<typeof ModelAssessmentContext> =
    defaultModelAssessmentContext;
  public render(): React.ReactNode {
    let dropdownStyles: Partial<IDropdownStyles> = {
      dropdown: { marginRight: "20px" }
    };
    const options: IDropdownOption[] = [];
    const modelType = this.context.modelMetadata.modelType;
    if (IsBinary(modelType)) {
      options.push(this.addDropdownOption(Metrics.ErrorRate));
      options.push(this.addDropdownOption(Metrics.PrecisionScore));
      options.push(this.addDropdownOption(Metrics.RecallScore));
      options.push(this.addDropdownOption(Metrics.F1Score));
      options.push(this.addDropdownOption(Metrics.AccuracyScore));
    } else if (modelType === ModelTypes.Regression) {
      options.push(this.addDropdownOption(Metrics.MeanSquaredError));
      options.push(this.addDropdownOption(Metrics.MeanAbsoluteError));
    } else if (IsMulticlass(modelType)) {
      dropdownStyles = {
        dropdown: { marginRight: "20px", width: 235 }
      };
      options.push(this.addDropdownOption(Metrics.ErrorRate));
      options.push(this.addDropdownOption(Metrics.MacroPrecisionScore));
      options.push(this.addDropdownOption(Metrics.MicroPrecisionScore));
      options.push(this.addDropdownOption(Metrics.MacroRecallScore));
      options.push(this.addDropdownOption(Metrics.MicroRecallScore));
      options.push(this.addDropdownOption(Metrics.MicroF1Score));
      options.push(this.addDropdownOption(Metrics.MacroF1Score));
      options.push(this.addDropdownOption(Metrics.AccuracyScore));
    } else if (IsMultilabel(modelType)) {
      options.push(this.addDropdownOption(Metrics.ErrorRate));
    }
    return (
      <Dropdown
        label={localization.ErrorAnalysis.MetricSelector.selectorLabel}
        options={options}
        styles={dropdownStyles}
        onChange={this.handleMetricChanged}
        selectedKey={this.context.errorAnalysisData?.metric}
        disabled={!this.props.isEnabled}
      />
    );
  }

  private addDropdownOption(metric: string): IDropdownOption {
    return {
      key: metric,
      text: MetricUtils.getLocalizedMetric(metric, MetricLocalizationType.Name)
    };
  }

  private handleMetricChanged = (
    _: React.FormEvent<HTMLDivElement>,
    item?: IDropdownOption
  ): void => {
    if (item) {
      this.props.setMetric(item.key.toString());
      this.props.telemetryHook?.({
        level: TelemetryLevels.ButtonClick,
        type: TelemetryEventName.ErrorAnalysisNewMetricSelected
      });
    }
  };
}

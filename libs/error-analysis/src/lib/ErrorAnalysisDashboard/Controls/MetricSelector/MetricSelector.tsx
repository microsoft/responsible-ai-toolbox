// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  Metrics,
  ModelTypes,
  ModelAssessmentContext,
  defaultModelAssessmentContext
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import {
  Dropdown,
  IDropdownOption,
  IDropdownStyles
} from "office-ui-fabric-react";
import React from "react";

import { MetricLocalizationType, MetricUtils } from "../../MetricUtils";

export interface IMetricSelectorProps {
  isEnabled: boolean;
  setMetric: (metric: string) => void;
}

export class MetricSelector extends React.Component<IMetricSelectorProps> {
  public static contextType = ModelAssessmentContext;
  public context: React.ContextType<typeof ModelAssessmentContext> =
    defaultModelAssessmentContext;
  public render(): React.ReactNode {
    let dropdownStyles: Partial<IDropdownStyles> = {
      dropdown: { width: 200 }
    };
    const options: IDropdownOption[] = [];
    const modelType = this.context.modelMetadata.modelType;
    if (modelType === ModelTypes.Binary) {
      options.push(this.addDropdownOption(Metrics.ErrorRate));
      options.push(this.addDropdownOption(Metrics.PrecisionScore));
      options.push(this.addDropdownOption(Metrics.RecallScore));
      options.push(this.addDropdownOption(Metrics.F1Score));
      options.push(this.addDropdownOption(Metrics.AccuracyScore));
    } else if (modelType === ModelTypes.Regression) {
      options.push(this.addDropdownOption(Metrics.MeanSquaredError));
      options.push(this.addDropdownOption(Metrics.MeanAbsoluteError));
    } else if (modelType === ModelTypes.Multiclass) {
      dropdownStyles = {
        dropdown: { width: 235 }
      };
      options.push(this.addDropdownOption(Metrics.ErrorRate));
      options.push(this.addDropdownOption(Metrics.MacroPrecisionScore));
      options.push(this.addDropdownOption(Metrics.MacroRecallScore));
      options.push(this.addDropdownOption(Metrics.MicroPrecisionScore));
      options.push(this.addDropdownOption(Metrics.MicroRecallScore));
      options.push(this.addDropdownOption(Metrics.MicroF1Score));
      options.push(this.addDropdownOption(Metrics.MacroF1Score));
      options.push(this.addDropdownOption(Metrics.AccuracyScore));
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
    }
  };
}

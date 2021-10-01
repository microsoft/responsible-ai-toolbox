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
      options.push({
        key: Metrics.ErrorRate,
        text: MetricUtils.getLocalizedMetric(
          Metrics.ErrorRate,
          MetricLocalizationType.Name
        )
      });
      options.push({
        key: Metrics.PrecisionScore,
        text: MetricUtils.getLocalizedMetric(
          Metrics.PrecisionScore,
          MetricLocalizationType.Name
        )
      });
      options.push({
        key: Metrics.RecallScore,
        text: MetricUtils.getLocalizedMetric(
          Metrics.RecallScore,
          MetricLocalizationType.Name
        )
      });
    } else if (modelType === ModelTypes.Regression) {
      options.push({
        key: Metrics.MeanSquaredError,
        text: MetricUtils.getLocalizedMetric(
          Metrics.MeanSquaredError,
          MetricLocalizationType.Name
        )
      });
      options.push({
        key: Metrics.MeanAbsoluteError,
        text: MetricUtils.getLocalizedMetric(
          Metrics.MeanAbsoluteError,
          MetricLocalizationType.Name
        )
      });
    } else if (modelType === ModelTypes.Multiclass) {
      dropdownStyles = {
        dropdown: { width: 235 }
      };
      options.push({
        key: Metrics.ErrorRate,
        text: MetricUtils.getLocalizedMetric(
          Metrics.ErrorRate,
          MetricLocalizationType.Name
        )
      });
      options.push({
        key: Metrics.MacroPrecisionScore,
        text: MetricUtils.getLocalizedMetric(
          Metrics.MacroPrecisionScore,
          MetricLocalizationType.Name
        )
      });
      options.push({
        key: Metrics.MacroRecallScore,
        text: MetricUtils.getLocalizedMetric(
          Metrics.MacroRecallScore,
          MetricLocalizationType.Name
        )
      });
      options.push({
        key: Metrics.MicroPrecisionScore,
        text: MetricUtils.getLocalizedMetric(
          Metrics.MicroPrecisionScore,
          MetricLocalizationType.Name
        )
      });
      options.push({
        key: Metrics.MicroRecallScore,
        text: MetricUtils.getLocalizedMetric(
          Metrics.MicroRecallScore,
          MetricLocalizationType.Name
        )
      });
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

  private handleMetricChanged = (
    _: React.FormEvent<HTMLDivElement>,
    item?: IDropdownOption
  ): void => {
    if (item) {
      this.props.setMetric(item.key.toString());
    }
  };
}

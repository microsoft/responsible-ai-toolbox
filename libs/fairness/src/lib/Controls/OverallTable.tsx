// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  DetailsList,
  DetailsListLayoutMode,
  FontWeights,
  IColumn,
  SelectionMode,
  Text
} from "@fluentui/react";
import { IMetricResponse, PredictionTypes } from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import React from "react";

import {
  IPerformancePickerPropsV2,
  IFairnessPickerPropsV2
} from "../FairnessWizard";
import { IMetrics } from "../IMetrics";
import { fairnessOptions } from "../util/FairnessMetrics";
import { FormatMetrics } from "../util/FormatMetrics";
import { IFairnessContext } from "../util/IFairnessContext";
import { performanceOptions } from "../util/PerformanceMetrics";
import { getOutcomeKey } from "../WizardReportHelper";

export interface IOverallTableProps {
  dashboardContext: IFairnessContext;
  performancePickerProps: IPerformancePickerPropsV2;
  fairnessPickerProps: IFairnessPickerPropsV2;
  metrics: IMetrics;
}

export class OverallTable extends React.PureComponent<IOverallTableProps> {
  public render(): React.ReactNode {
    const binLabels = this.props.dashboardContext.groupNames;
    const binValues = this.props.metrics.performance.bins;
    const additionalMetrics = this.getAdditionalMetrics();
    const formattedBinValues = this.getFormattedBinValues(additionalMetrics);
    const metricLabels = this.getMetricLabels(additionalMetrics);
    const overallMetrics = this.getOverallMetrics(additionalMetrics);
    let minIndexes = [];
    let maxIndexes = [];
    let minValue = Number.MAX_SAFE_INTEGER;
    let maxValue = Number.MIN_SAFE_INTEGER;
    binValues.forEach((value, index) => {
      if (value >= maxValue) {
        if (value === maxValue) {
          maxIndexes.push(index);
        } else {
          maxIndexes = [index];
          maxValue = value;
        }
      }
      if (value <= minValue) {
        if (value === minValue) {
          minIndexes.push(index);
        } else {
          minIndexes = [index];
          minValue = value;
        }
      }
    });

    const items: Array<{ key: any }> = [];
    if (formattedBinValues.length > 0 && formattedBinValues[0]) {
      // add row for overall metrics
      const item = {
        binLabel: localization.Fairness.Report.overallLabel,
        key: "binLabel"
      };
      overallMetrics.forEach((metric, colIndex) => {
        item[`metric${colIndex}`] = metric;
      });
      items.push(item);

      // add rows for each group
      formattedBinValues[0].forEach((_, rowIndex) => {
        const item = {
          binLabel: binLabels[rowIndex],
          key: rowIndex
        };
        formattedBinValues.forEach((metricArray, colIndex) => {
          if (metricArray) {
            item[`metric${colIndex}`] = metricArray[rowIndex];
          } else {
            item[`metric${colIndex}`] = "empty";
          }
        });
        items.push(item);
      });
    }

    const columns: IColumn[] = [
      {
        fieldName: "binLabel",
        isResizable: true,
        key: "columnBin",
        maxWidth: 100,
        minWidth: 50,
        name: "",
        onRender: this.renderBinColumn
      }
    ];
    metricLabels.forEach((colName, colIndex) => {
      columns.push({
        fieldName: `metric${colIndex}`,
        isResizable: true,
        key: `column${colIndex}`,
        maxWidth: 150,
        minWidth: 75,
        name: colName
      });
    });

    return (
      <DetailsList
        items={items}
        columns={columns}
        setKey="set"
        layoutMode={DetailsListLayoutMode.justified}
        selectionMode={SelectionMode.none}
      />
    );
  }

  private readonly renderBinColumn = (item?: any): React.ReactNode => {
    if (!item) {
      return undefined;
    }
    return (
      <Text
        styles={{
          root: {
            fontWeight: FontWeights.semibold
          }
        }}
        block
      >
        {item.binLabel}
      </Text>
    );
  };

  private readonly getFormattedBinValues = (
    additionalMetrics: Map<string, IMetricResponse>
  ): string[][] => {
    const formattedBinPerformanceValues =
      this.props.metrics.performance.bins.map((value) =>
        FormatMetrics.formatNumbers(
          value,
          this.props.performancePickerProps.selectedPerformanceKey
        )
      );
    const formattedBinOutcomeValues = this.props.metrics.outcomes.bins.map(
      (value) =>
        FormatMetrics.formatNumbers(
          value,
          getOutcomeKey(this.props.dashboardContext)
        )
    );

    // set the table columns to consist of performance and outcome as well
    // as any additional metrics that may be relevant for the selected task
    const formattedBinValues = [
      formattedBinPerformanceValues,
      formattedBinOutcomeValues,
      formattedBinOutcomeValues.map(() => "") // empty entries for fairness outcome column
    ];
    additionalMetrics.forEach((metricObject, metricName) => {
      formattedBinValues.push(
        metricObject?.bins.map((value) => {
          return FormatMetrics.formatNumbers(value, metricName);
        })
      );
    });
    return formattedBinValues;
  };

  private readonly getOverallMetrics = (
    additionalMetrics: Map<string, IMetricResponse>
  ): string[] => {
    const globalPerformanceString = FormatMetrics.formatNumbers(
      this.props.metrics.performance.global,
      this.props.performancePickerProps.selectedPerformanceKey
    );

    const fairnessMetricString = FormatMetrics.formatNumbers(
      this.props.metrics.disparities[
        this.props.fairnessPickerProps.selectedFairnessKey
      ],
      this.props.performancePickerProps.selectedPerformanceKey
    );

    const globalOutcomeString = FormatMetrics.formatNumbers(
      this.props.metrics.outcomes.global,
      getOutcomeKey(this.props.dashboardContext)
    );
    const overallMetrics = [
      globalPerformanceString,
      globalOutcomeString,
      fairnessMetricString
    ];
    additionalMetrics.forEach((metricObject, metricName) => {
      overallMetrics.push(
        FormatMetrics.formatNumbers(metricObject?.global, metricName)
      );
    });
    return overallMetrics;
  };
  private readonly getMetricLabels = (
    additionalMetrics: Map<string, IMetricResponse>
  ): string[] => {
    const metricLabels = [
      (
        this.props.performancePickerProps.performanceOptions.find(
          (a) =>
            a.key === this.props.performancePickerProps.selectedPerformanceKey
        ) ||
        performanceOptions[
          this.props.performancePickerProps.selectedPerformanceKey
        ]
      ).title,
      performanceOptions[getOutcomeKey(this.props.dashboardContext)].title,
      (
        this.props.fairnessPickerProps.fairnessOptions.find(
          (a) => a.key === this.props.fairnessPickerProps.selectedFairnessKey
        ) || fairnessOptions[this.props.fairnessPickerProps.selectedFairnessKey]
      ).title
    ];
    additionalMetrics.forEach((_, metricName) => {
      metricLabels.push(performanceOptions[metricName].title);
    });
    return metricLabels;
  };

  private readonly getAdditionalMetrics = (): Map<string, IMetricResponse> => {
    // define task-specific metrics to show by default
    const additionalMetrics: Map<string, IMetricResponse> = new Map();

    switch (this.props.dashboardContext.modelMetadata.PredictionType) {
      case PredictionTypes.BinaryClassification: {
        if (this.props.metrics.falsePositiveRates) {
          additionalMetrics.set(
            "fallout_rate",
            this.props.metrics.falsePositiveRates
          );
        }
        if (this.props.metrics.falseNegativeRates) {
          additionalMetrics.set(
            "miss_rate",
            this.props.metrics.falseNegativeRates
          );
        }
        break;
      }
      case PredictionTypes.Probability: {
        if (this.props.metrics.overpredictions) {
          additionalMetrics.set(
            "overprediction",
            this.props.metrics.overpredictions
          );
        }
        if (this.props.metrics.underpredictions) {
          additionalMetrics.set(
            "underprediction",
            this.props.metrics.underpredictions
          );
        }
        break;
      }
      case PredictionTypes.Regression: {
        // TODO: define additional metrics for regression
        break;
      }
      default: {
        throw new Error(
          `Unexpected task type ${this.props.dashboardContext.modelMetadata.PredictionType}.`
        );
      }
    }
    return additionalMetrics;
  };
}

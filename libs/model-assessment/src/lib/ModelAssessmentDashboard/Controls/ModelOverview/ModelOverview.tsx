// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  MissingParametersPlaceholder,
  defaultModelAssessmentContext,
  ModelAssessmentContext,
  OverallMetricChart,
  BinaryClassificationMetrics,
  RegressionMetrics
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import { Dropdown, IDropdownOption, Stack, Text } from "office-ui-fabric-react";
import React from "react";

import { DatasetCohortStatsTable } from "./DatasetCohortStatsTable";

interface IModelOverviewProps {
  showNewModelOverviewExperience: boolean;
}

interface IModelOverviewState {
  selectedMetrics: string[];
  selectedFeatures: number[];
  isFeaturePickerLimitExceededDialogOpen: boolean;
}

export class ModelOverview extends React.Component<
  IModelOverviewProps,
  IModelOverviewState
> {
  public static contextType = ModelAssessmentContext;
  public context: React.ContextType<typeof ModelAssessmentContext> =
    defaultModelAssessmentContext;

  constructor(props: IModelOverviewProps) {
    super(props);
    this.state = {
      isFeaturePickerLimitExceededDialogOpen: false,
      selectedFeatures: [],
      selectedMetrics: []
    };
  }

  public componentDidMount(): void {
    let defaultSelectedMetrics: string[] = [];
    if (this.context.dataset.task_type === "classification") {
      defaultSelectedMetrics = [
        BinaryClassificationMetrics.Accuracy,
        BinaryClassificationMetrics.FalsePositiveRate,
        BinaryClassificationMetrics.FalseNegativeRate,
        BinaryClassificationMetrics.SelectionRate
      ];
    } else {
      // task_type === "regression"
      defaultSelectedMetrics = [
        RegressionMetrics.MeanAbsoluteError,
        RegressionMetrics.MeanSquaredError,
        RegressionMetrics.MeanPrediction
      ];
    }
    this.setState({ selectedMetrics: defaultSelectedMetrics });
  }

  public render(): React.ReactNode {
    if (this.context.dataset.predicted_y === undefined) {
      return (
        <MissingParametersPlaceholder>
          {localization.Interpret.ModelPerformance.missingParameters}
        </MissingParametersPlaceholder>
      );
    }

    const selectableMetrics: IDropdownOption[] = [];
    if (this.context.dataset.task_type === "classification") {
      // TODO: add case for multiclass classification
      selectableMetrics.push(
        {
          key: BinaryClassificationMetrics.Accuracy,
          text: localization.ModelAssessment.ModelOverview.accuracy
        },
        {
          key: BinaryClassificationMetrics.F1Score,
          text: localization.ModelAssessment.ModelOverview.f1Score
        },
        {
          key: BinaryClassificationMetrics.Precision,
          text: localization.ModelAssessment.ModelOverview.precision
        },
        {
          key: BinaryClassificationMetrics.Recall,
          text: localization.ModelAssessment.ModelOverview.recall
        },
        {
          key: BinaryClassificationMetrics.FalsePositiveRate,
          text: localization.ModelAssessment.ModelOverview.falsePositiveRate
        },
        {
          key: BinaryClassificationMetrics.FalseNegativeRate,
          text: localization.ModelAssessment.ModelOverview.falseNegativeRate
        },
        {
          key: BinaryClassificationMetrics.SelectionRate,
          text: localization.ModelAssessment.ModelOverview.selectionRate
        }
      );
    } else {
      // task_type === "regression"
      selectableMetrics.push(
        {
          key: RegressionMetrics.MeanAbsoluteError,
          text: localization.ModelAssessment.ModelOverview.meanAbsoluteError
        },
        {
          key: RegressionMetrics.MeanSquaredError,
          text: localization.ModelAssessment.ModelOverview.meanSquaredError
        },
        {
          key: RegressionMetrics.MeanPrediction,
          text: localization.ModelAssessment.ModelOverview.meanPrediction
        }
      );
    }

    const columns: string[] = [
      localization.ModelAssessment.ModelOverview.countColumnHeader
    ];
    columns.push(
      ...selectableMetrics
        .filter((element) =>
          this.state.selectedMetrics.includes(element.key.toString())
        )
        .map((element) => {
          return element.text;
        })
    );

    return (
      <Stack tokens={{ childrenGap: "10px", padding: "16px 40px 10px 40px" }}>
        <Text variant="medium">
          {localization.Interpret.ModelPerformance.helperText}
        </Text>
        {!this.props.showNewModelOverviewExperience && <OverallMetricChart />}
        {this.props.showNewModelOverviewExperience && (
          <>
            <Dropdown
              placeholder={
                localization.ModelAssessment.ModelOverview
                  .metricSelectionDropdownPlaceholder
              }
              label={localization.ModelAssessment.ModelOverview.metricsDropdown}
              selectedKeys={this.state.selectedMetrics}
              options={selectableMetrics}
              onChange={this.onMetricSelectionChange}
              multiSelect
              styles={{ dropdown: { width: 400 } }}
            />
            <DatasetCohortStatsTable
              selectableMetrics={selectableMetrics}
              selectedMetrics={this.state.selectedMetrics}
            />
          </>
        )}
      </Stack>
    );
  }

  private onMetricSelectionChange = (
    _: React.FormEvent<HTMLDivElement>,
    item?: IDropdownOption
  ): void => {
    if (item && item.selected !== undefined) {
      if (
        item.selected &&
        !this.state.selectedMetrics.includes(item.key.toString())
      ) {
        this.setState({
          selectedMetrics: this.state.selectedMetrics.concat([
            item.key.toString()
          ])
        });
      }
      if (
        !item.selected &&
        this.state.selectedMetrics.includes(item.key.toString())
      ) {
        const selectedMetrics = this.state.selectedMetrics;
        const unselectedMetricIndex = selectedMetrics.findIndex(
          (key) => key === item.key.toString()
        );
        // remove unselected metric
        selectedMetrics.splice(unselectedMetricIndex, 1);
        this.setState({
          selectedMetrics
        });
      }
    }
  };
}

// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IDropdownOption, Stack } from "@fluentui/react";
import {
  defaultModelAssessmentContext,
  ModelAssessmentContext,
  ErrorCohort,
  ILabeledStatistic
} from "@responsible-ai/core-ui";
import React from "react";

import { CohortStatsHeatmap } from "./CohortStatsHeatmap";
import { FairnessMetricTable } from "./FairnessMetricTable";
import { generateCohortsStatsTable } from "./StatsTableUtils";

interface IDisaggregatedAnalysisTableProps {
  labeledStatistics: ILabeledStatistic[][];
  selectableMetrics: IDropdownOption[];
  selectedMetrics: string[];
  selectedFeatures: number[];
  featureBasedCohorts: ErrorCohort[];
  showHeatmapColors: boolean;
  modelType: string;
}

class IDisaggregatedAnalysisTableState {}

export class DisaggregatedAnalysisTable extends React.Component<
  IDisaggregatedAnalysisTableProps,
  IDisaggregatedAnalysisTableState
> {
  public static contextType = ModelAssessmentContext;
  public context: React.ContextType<typeof ModelAssessmentContext> =
    defaultModelAssessmentContext;

  public render(): React.ReactNode {
    const cohortStatsInfo = generateCohortsStatsTable(
      this.props.featureBasedCohorts,
      this.props.selectableMetrics,
      this.props.labeledStatistics,
      this.props.selectedMetrics,
      this.props.showHeatmapColors,
      this.props.modelType
    );
    if (this.props.selectedFeatures.length === 0) {
      return React.Fragment;
    }
    return (
      <Stack id="modelOverviewDisaggregatedAnalysisTable">
        <CohortStatsHeatmap
          id={"modelOverviewDisaggregatedCohortsTable"}
          items={cohortStatsInfo.items}
          cohorts={this.props.featureBasedCohorts}
          selectableMetrics={this.props.selectableMetrics}
          selectedMetrics={this.props.selectedMetrics}
          showColors={this.props.showHeatmapColors}
        />
        <FairnessMetricTable
          fairnessStats={cohortStatsInfo.fairnessStats}
          cohorts={this.props.featureBasedCohorts}
          selectableMetrics={this.props.selectableMetrics}
          selectedMetrics={this.props.selectedMetrics}
        />
      </Stack>
    );
  }
}

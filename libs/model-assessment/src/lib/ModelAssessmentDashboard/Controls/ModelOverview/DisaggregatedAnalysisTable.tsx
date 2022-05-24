// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  defaultModelAssessmentContext,
  ModelAssessmentContext,
  ErrorCohort,
  generateMetrics,
  JointDataset
} from "@responsible-ai/core-ui";
import { IDropdownOption, Stack } from "office-ui-fabric-react";
import React from "react";

import { CohortStatsHeatmap } from "./CohortStatsHeatmap";
import { FairnessMetricTable } from "./FairnessMetricTable";
import { generateCohortsStatsTable } from "./StatsTableUtils";

interface IDisaggregatedAnalysisTableProps {
  selectableMetrics: IDropdownOption[];
  selectedMetrics: string[];
  selectedFeatures: number[];
  featureBasedCohorts: ErrorCohort[];
  showHeatmapColors: boolean;
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
    // generate table contents
    const cohortLabeledStatistics = generateMetrics(
      this.context.jointDataset,
      this.props.featureBasedCohorts.map((errorCohort) =>
        errorCohort.cohort.unwrap(JointDataset.IndexLabel)
      ),
      this.context.modelMetadata.modelType
    );

    const cohortStatsInfo = generateCohortsStatsTable(
      this.props.featureBasedCohorts,
      this.props.selectableMetrics,
      cohortLabeledStatistics,
      this.props.selectedMetrics,
      this.props.showHeatmapColors
    );
    if (this.props.selectedFeatures.length === 0) {
      return React.Fragment;
    }
    return (
      <Stack>
        <CohortStatsHeatmap
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

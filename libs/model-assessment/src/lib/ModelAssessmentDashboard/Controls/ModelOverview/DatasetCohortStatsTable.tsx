// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IDropdownOption } from "@fluentui/react";
import {
  defaultModelAssessmentContext,
  generateMetrics,
  JointDataset,
  ModelAssessmentContext
} from "@responsible-ai/core-ui";
import React from "react";

import { CohortStatsHeatmap } from "./CohortStatsHeatmap";
import { generateCohortsStatsTable } from "./StatsTableUtils";

interface IDatasetCohortStatsTableProps {
  selectableMetrics: IDropdownOption[];
  selectedMetrics: string[];
  showHeatmapColors: boolean;
}

class IDatasetCohortStatsTableState {}

export class DatasetCohortStatsTable extends React.Component<
  IDatasetCohortStatsTableProps,
  IDatasetCohortStatsTableState
> {
  public static contextType = ModelAssessmentContext;
  public context: React.ContextType<typeof ModelAssessmentContext> =
    defaultModelAssessmentContext;

  public render(): React.ReactNode {
    // generate table contents
    const cohortLabeledStatistics = generateMetrics(
      this.context.jointDataset,
      this.context.errorCohorts.map((errorCohort) =>
        errorCohort.cohort.unwrap(JointDataset.IndexLabel)
      ),
      this.context.modelMetadata.modelType
    );

    const items = generateCohortsStatsTable(
      this.context.errorCohorts,
      this.props.selectableMetrics,
      cohortLabeledStatistics,
      this.props.selectedMetrics,
      this.props.showHeatmapColors
    ).items;

    const showColors =
      this.props.showHeatmapColors && this.context.errorCohorts.length > 1;

    return (
      <CohortStatsHeatmap
        id={"modelOverviewDatasetCohortStatsTable"}
        items={items}
        cohorts={this.context.errorCohorts}
        selectableMetrics={this.props.selectableMetrics}
        selectedMetrics={this.props.selectedMetrics}
        showColors={showColors}
      />
    );
  }
}

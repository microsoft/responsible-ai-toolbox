// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IDropdownOption } from "@fluentui/react";
import {
  defaultModelAssessmentContext,
  ModelAssessmentContext,
  ILabeledStatistic,
  ErrorCohort
} from "@responsible-ai/core-ui";
import React from "react";

import { CohortStatsHeatmap } from "./CohortStatsHeatmap";
import { generateCohortsStatsTable } from "./StatsTableUtils";

interface IDatasetCohortStatsTableProps {
  datasetBasedCohorts: ErrorCohort[];
  labeledStatistics: ILabeledStatistic[][];
  selectableMetrics: IDropdownOption[];
  selectedMetrics: string[];
  showHeatmapColors: boolean;
  modelType: string;
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
    const items = generateCohortsStatsTable(
      this.props.datasetBasedCohorts,
      this.props.selectableMetrics,
      this.props.labeledStatistics,
      this.props.selectedMetrics,
      this.props.showHeatmapColors,
      this.props.modelType
    ).items;

    const showColors =
      this.props.showHeatmapColors && this.props.datasetBasedCohorts.length > 1;

    return (
      <CohortStatsHeatmap
        id={"modelOverviewDatasetCohortStatsTable"}
        items={items}
        cohorts={this.props.datasetBasedCohorts}
        selectableMetrics={this.props.selectableMetrics}
        selectedMetrics={this.props.selectedMetrics}
        showColors={showColors}
      />
    );
  }
}

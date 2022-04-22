// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  defaultModelAssessmentContext,
  generateMetrics,
  JointDataset,
  ModelAssessmentContext
} from "@responsible-ai/core-ui";
import { IDropdownOption } from "office-ui-fabric-react";
import React from "react";

import { CohortStatsHeatmap } from "./CohortStatsHeatmap";
import { generateCohortsStatsTable } from "./StatsTableUtils";

interface IDatasetCohortStatsTableProps {
  selectableMetrics: IDropdownOption[];
  selectedMetrics: string[];
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
      this.props.selectedMetrics
    ).items;

    return (
      <CohortStatsHeatmap
        items={items}
        cohorts={this.context.errorCohorts}
        selectableMetrics={this.props.selectableMetrics}
        selectedMetrics={this.props.selectedMetrics}
      />
    );
  }
}

// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  defaultModelAssessmentContext,
  ModelAssessmentContext} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import { IDropdownOption } from "office-ui-fabric-react";
import React from "react";
import { CohortStatsHeatmap } from "./CohortStatsHeatmap";

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
    return (
      <CohortStatsHeatmap
        title={localization.ModelAssessment.ModelOverview
          .dataCohortsHeatmapHeader}
        cohorts={this.context.errorCohorts}
        selectableMetrics={this.props.selectableMetrics}
        selectedMetrics={this.props.selectedMetrics}
      />
    );
  }
}

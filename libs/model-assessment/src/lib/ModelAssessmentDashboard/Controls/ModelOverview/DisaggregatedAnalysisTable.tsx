// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  defaultModelAssessmentContext,
  ModelAssessmentContext,
  ErrorCohort
} from "@responsible-ai/core-ui";
import { IDropdownOption } from "office-ui-fabric-react";
import React from "react";

import { CohortStatsHeatmap } from "./CohortStatsHeatmap";

interface IDisaggregatedAnalysisTableProps {
  selectableMetrics: IDropdownOption[];
  selectedMetrics: string[];
  selectedFeatures: number[];
  featureBasedCohorts: ErrorCohort[];
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
    if (this.props.selectedFeatures.length > 0) {
      return (
        <CohortStatsHeatmap
          cohorts={this.props.featureBasedCohorts}
          selectableMetrics={this.props.selectableMetrics}
          selectedMetrics={this.props.selectedMetrics}
        />
      );
    }
    return React.Fragment;
  }
}

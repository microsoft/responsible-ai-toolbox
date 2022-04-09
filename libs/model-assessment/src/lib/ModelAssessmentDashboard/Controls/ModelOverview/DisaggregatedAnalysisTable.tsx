// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  defaultModelAssessmentContext,
  ModelAssessmentContext,
  ErrorCohort
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import {
  ActionButton,
  IDropdownOption,
  IDropdown
} from "office-ui-fabric-react";
import React from "react";

import { CohortStatsHeatmap } from "./CohortStatsHeatmap";

interface IDisaggregatedAnalysisTableProps {
  selectableMetrics: IDropdownOption[];
  selectedMetrics: string[];
  selectedFeatures: number[];
  featureBasedCohorts: ErrorCohort[];
  featureDropdownRef: React.RefObject<IDropdown>;
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
    return (
      <>
        {this.props.selectedFeatures.length === 0 && (
          <ActionButton
            onClick={() => {
              this.props.featureDropdownRef.current?.focus(true);
            }}
          >
            {
              localization.ModelAssessment.ModelOverview
                .disaggregatedAnalysisFeatureSelectionPlaceholder
            }
          </ActionButton>
        )}
        {this.props.selectedFeatures.length > 0 && (
          <CohortStatsHeatmap
            title={
              localization.ModelAssessment.ModelOverview
                .disaggregatedAnalysisHeatmapHeader
            }
            cohorts={this.props.featureBasedCohorts}
            selectableMetrics={this.props.selectableMetrics}
            selectedMetrics={this.props.selectedMetrics}
          />
        )}
      </>
    );
  }
}

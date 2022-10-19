// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Pivot, PivotItem } from "@fluentui/react";
import {
  defaultModelAssessmentContext,
  ModelAssessmentContext,
  ModelTypes,
  ErrorCohort,
  ITelemetryEvent,
  ILabeledStatistic
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import * as _ from "lodash";
import React from "react";

import { ConfusionMatrixHeatmap } from "./ConfusionMatrixHeatmap";
// import { modelOverviewStyles } from "./ModelOverview.styles";
import { ModelOverviewMetricChart } from "./ModelOverviewMetricChart";
import { IProbabilityDistributionBoxChartState } from "./ProbabilityDistributionBoxChart";
import { ProbabilityDistributionChart } from "./ProbabilityDistributionChart";
import { IMetricOption } from "./StatsTableUtils";

interface IModelOverviewChartPivotProps {
  onChooseCohorts: () => void;
  cohorts: ErrorCohort[];
  telemetryHook?: (message: ITelemetryEvent) => void;
  boxPlotState: IProbabilityDistributionBoxChartState;
  onBoxPlotStateUpdate: (
    boxChartState: IProbabilityDistributionBoxChartState
  ) => void;
  onToggleChange: (checked: boolean) => void;
  showSplineChart: boolean;
  onApplyMetric: (metric: string) => void;
  selectableMetrics: IMetricOption[];
  cohortStats: ILabeledStatistic[][];
  selectedMetric: string;
}

export class ModelOverviewChartPivot extends React.Component<IModelOverviewChartPivotProps> {
  public static contextType = ModelAssessmentContext;
  public context: React.ContextType<typeof ModelAssessmentContext> =
    defaultModelAssessmentContext;

  public render(): React.ReactNode {
    return (
      <Pivot id="modelOverviewChartPivot" overflowBehavior="menu">
        {this.context.modelMetadata.modelType === ModelTypes.Binary && (
          <PivotItem
            headerText={
              localization.ModelAssessment.ModelOverview
                .probabilityDistributionPivotItem
            }
          >
            <ProbabilityDistributionChart
              onChooseCohorts={this.props.onChooseCohorts}
              cohorts={this.props.cohorts}
              telemetryHook={this.props.telemetryHook}
              boxPlotState={this.props.boxPlotState}
              onBoxPlotStateUpdate={this.props.onBoxPlotStateUpdate}
              onToggleChange={this.props.onToggleChange}
              showSplineChart={this.props.showSplineChart}
            />
          </PivotItem>
        )}
        <PivotItem
          headerText={
            localization.ModelAssessment.ModelOverview
              .metricsVisualizationsPivotItem
          }
        >
          <ModelOverviewMetricChart
            onChooseCohorts={this.props.onChooseCohorts}
            onApplyMetric={this.props.onApplyMetric}
            selectableMetrics={this.props.selectableMetrics}
            cohorts={this.props.cohorts}
            cohortStats={this.props.cohortStats}
            selectedMetric={this.props.selectedMetric}
          />
        </PivotItem>
        {(this.context.modelMetadata.modelType === ModelTypes.Binary ||
          this.context.modelMetadata.modelType === ModelTypes.Multiclass) && (
          <PivotItem
            headerText={
              localization.ModelAssessment.ModelOverview
                .confusionMatrixPivotItem
            }
          >
            <ConfusionMatrixHeatmap id="Confusion Matrix Heatmap" />
          </PivotItem>
        )}
      </Pivot>
    );
  }
}

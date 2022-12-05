// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Pivot, PivotItem } from "@fluentui/react";
import {
  defaultModelAssessmentContext,
  ModelAssessmentContext,
  ModelTypes,
  ErrorCohort,
  ITelemetryEvent,
  ILabeledStatistic,
  IsBinary,
  IBoxChartState,
  MissingParametersPlaceholder,
  IsMulticlass
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import React from "react";

import _ from "lodash";

import { ModelOverviewMetricChart } from "./ModelOverviewMetricChart";
import { ProbabilityDistributionChart } from "./ProbabilityDistributionChart";

import { ConfusionMatrixHeatmap } from "./ConfusionMatrixHeatmap";
import { getSelectableMetrics, IMetricOption } from "./StatsTableUtils";
import { modelOverviewStyles } from "./ModelOverview.styles";
import { RegressionDistributionChart } from "./RegressionDistributionChart";

interface IModelOverviewChartPivotProps {
  onChooseCohorts: () => void;
  cohorts: ErrorCohort[];
  labeledStatistics: ILabeledStatistic[][];
  telemetryHook?: (message: ITelemetryEvent) => void;
  selectedMetrics: string[];
  selectableMetrics: IMetricOption[];
  cohortStats: ILabeledStatistic[][];
}

interface IModelOverviewChartPivotState {
  probabilityDistributionBoxPlotState: IBoxChartState;
  regressionDistributionBoxPlotState: IBoxChartState;
  showSplineChart: boolean;
  selectedMetric: string;
}

export class ModelOverviewChartPivot extends React.Component<
  IModelOverviewChartPivotProps,
  IModelOverviewChartPivotState
> {
  public static contextType = ModelAssessmentContext;
  public context: React.ContextType<typeof ModelAssessmentContext> =
    defaultModelAssessmentContext;

  public constructor(props: IModelOverviewChartPivotProps) {
    super(props);
    this.state = {
      probabilityDistributionBoxPlotState: {
        boxPlotData: [],
        outlierData: undefined
      },
      regressionDistributionBoxPlotState: {
        boxPlotData: [],
        outlierData: undefined
      },
      selectedMetric: "",
      showSplineChart: false
    };
  }

  public render(): React.ReactNode {
    if (this.context.dataset.predicted_y === undefined) {
      return (
        <MissingParametersPlaceholder>
          {localization.Interpret.ModelPerformance.missingParameters}
        </MissingParametersPlaceholder>
      );
    }

    const classNames = modelOverviewStyles();

    const selectableMetrics = getSelectableMetrics(
      this.context.dataset.task_type,
      IsMulticlass(this.context.jointDataset.getModelType())
    );

    const columns: string[] = [
      localization.ModelAssessment.ModelOverview.countColumnHeader
    ];
    columns.push(
      ...selectableMetrics
        .filter((element) =>
          this.props.selectedMetrics.includes(element.key.toString())
        )
        .map((element) => {
          return element.text;
        })
    );

    return (
      <Pivot
        id="modelOverviewChartPivot"
        overflowBehavior="menu"
        className={classNames.tabs}
      >
        {IsBinary(this.context.modelMetadata.modelType) && (
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
              onBoxPlotStateUpdate={
                this.onProbabilityDistributionBoxPlotStateUpdate
              }
              onToggleChange={this.onSplineToggleChange}
              showSplineChart={this.state.showSplineChart}
              boxPlotState={this.state.probabilityDistributionBoxPlotState}
            />
          </PivotItem>
        )}
        {this.context.modelMetadata.modelType === ModelTypes.Regression && (
          <PivotItem
            headerText={
              localization.ModelAssessment.ModelOverview
                .regressionDistributionPivotItem
            }
          >
            <RegressionDistributionChart
              onChooseCohorts={this.props.onChooseCohorts}
              cohorts={this.props.cohorts}
              onBoxPlotStateUpdate={
                this.onRegressionDistributionBoxPlotStateUpdate
              }
              boxPlotState={this.state.regressionDistributionBoxPlotState}
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
            selectableMetrics={this.props.selectableMetrics}
            cohorts={this.props.cohorts}
            cohortStats={this.props.cohortStats}
            selectedMetric={this.state.selectedMetric}
            onApplyMetric={this.onApplyMetric}
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
            <ConfusionMatrixHeatmap />
          </PivotItem>
        )}
      </Pivot>
    );
  }

  private onSplineToggleChange = (checked: boolean): void => {
    this.setState({ showSplineChart: checked });
  };

  private onProbabilityDistributionBoxPlotStateUpdate = (
    boxPlotState: IBoxChartState
  ): void => {
    if (
      !_.isEqual(this.state.probabilityDistributionBoxPlotState, boxPlotState)
    ) {
      this.setState({ probabilityDistributionBoxPlotState: boxPlotState });
    }
  };

  private onRegressionDistributionBoxPlotStateUpdate = (
    boxPlotState: IBoxChartState
  ): void => {
    if (
      !_.isEqual(this.state.regressionDistributionBoxPlotState, boxPlotState)
    ) {
      this.setState({ regressionDistributionBoxPlotState: boxPlotState });
    }
  };

  private onApplyMetric = (metric: string): void => {
    this.setState({ selectedMetric: metric });
  };
}

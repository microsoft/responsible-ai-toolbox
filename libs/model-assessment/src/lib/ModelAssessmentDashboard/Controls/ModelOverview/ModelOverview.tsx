// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  MissingParametersPlaceholder,
  defaultModelAssessmentContext,
  ModelAssessmentContext,
  OverallMetricChart,
  BinaryClassificationMetrics,
  RegressionMetrics,
  JointDataset,
  generateMetrics,
  ModelTypes,
  classificationTask
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import {
  Dropdown,
  IDropdownOption,
  Stack,
  Text,
  Pivot,
  PivotItem,
  IDropdown
} from "office-ui-fabric-react";
import React from "react";
import { ChartConfigurationFlyout } from "./ChartConfigurationFlyout";
import { DatasetCohortStatsTable } from "./DatasetCohortStatsTable";
import { DisaggregatedAnalysisTable } from "./DisaggregatedAnalysisTable";
import { generateOverlappingFeatureBasedCohorts } from "./DisaggregatedAnalysisUtils";

import { ModelOverviewMetricChart } from "./ModelOverviewMetricChart";
import { ProbabilityDistributionChart } from "./ProbabilityDistributionChart";

interface IModelOverviewProps {
  showNewModelOverviewExperience: boolean;
}

interface IModelOverviewState {
  selectedMetrics: string[];
  selectedFeatures: number[];
  isFeaturePickerLimitExceededDialogOpen: boolean;
  selectedDatasetCohorts: number[];
  selectedFeatureBasedCohorts: number[];
  chartConfigurationIsVisible: boolean;
}

export class ModelOverview extends React.Component<
  IModelOverviewProps,
  IModelOverviewState
> {
  public static contextType = ModelAssessmentContext;
  public context: React.ContextType<typeof ModelAssessmentContext> =
    defaultModelAssessmentContext;
  private featureDropdownRef = React.createRef<IDropdown>();

  constructor(props: IModelOverviewProps) {
    super(props);
    this.state = {
      selectedMetrics: [],
      selectedFeatures: [],
      isFeaturePickerLimitExceededDialogOpen: false,
      selectedDatasetCohorts: [],
      selectedFeatureBasedCohorts: [],
      chartConfigurationIsVisible: false
    };
  }

  public componentDidMount(): void {
    let defaultSelectedMetrics: string[] = [];
    if (this.context.dataset.task_type === classificationTask) {
      defaultSelectedMetrics = [
        BinaryClassificationMetrics.Accuracy,
        BinaryClassificationMetrics.FalsePositiveRate,
        BinaryClassificationMetrics.FalseNegativeRate,
        BinaryClassificationMetrics.SelectionRate
      ];
    } else {
      // task_type === "regression"
      defaultSelectedMetrics = [
        RegressionMetrics.MeanAbsoluteError,
        RegressionMetrics.MeanSquaredError,
        RegressionMetrics.MeanPrediction
      ];
    }
    this.setState({
      selectedMetrics: defaultSelectedMetrics,
      selectedDatasetCohorts: this.context.errorCohorts.map(
        (_cohort, index) => {
          return index;
        }
      )
    });
  }

  public render(): React.ReactNode {
    if (this.context.dataset.predicted_y === undefined) {
      return (
        <MissingParametersPlaceholder>
          {localization.Interpret.ModelPerformance.missingParameters}
        </MissingParametersPlaceholder>
      );
    }

    let selectableMetrics: IDropdownOption[] = [];
    if (this.context.dataset.task_type === classificationTask) {
      // TODO: add case for multiclass classification
      selectableMetrics.push(
        {
          key: BinaryClassificationMetrics.Accuracy,
          text: localization.ModelAssessment.ModelOverview.accuracy
        },
        {
          key: BinaryClassificationMetrics.F1Score,
          text: localization.ModelAssessment.ModelOverview.f1Score
        },
        {
          key: BinaryClassificationMetrics.Precision,
          text: localization.ModelAssessment.ModelOverview.precision
        },
        {
          key: BinaryClassificationMetrics.Recall,
          text: localization.ModelAssessment.ModelOverview.recall
        },
        {
          key: BinaryClassificationMetrics.FalsePositiveRate,
          text: localization.ModelAssessment.ModelOverview.falsePositiveRate
        },
        {
          key: BinaryClassificationMetrics.FalseNegativeRate,
          text: localization.ModelAssessment.ModelOverview.falseNegativeRate
        },
        {
          key: BinaryClassificationMetrics.SelectionRate,
          text: localization.ModelAssessment.ModelOverview.selectionRate
        }
      );
    } else {
      // task_type === "regression"
      selectableMetrics.push(
        {
          key: RegressionMetrics.MeanAbsoluteError,
          text: localization.ModelAssessment.ModelOverview.meanAbsoluteError
        },
        {
          key: RegressionMetrics.MeanSquaredError,
          text: localization.ModelAssessment.ModelOverview.meanSquaredError
        },
        {
          key: RegressionMetrics.MeanPrediction,
          text: localization.ModelAssessment.ModelOverview.meanPrediction
        }
      );
    }

    const columns: string[] = [
      localization.ModelAssessment.ModelOverview.countColumnHeader
    ];
    columns.push(
      ...selectableMetrics
        .filter((element) =>
          this.state.selectedMetrics.includes(element.key.toString())
        )
        .map((element) => {
          return element.text;
        })
    );

    // generate table contents for dataset cohorts
    const datasetCohortLabeledStatistics = generateMetrics(
      this.context.jointDataset,
      this.context.errorCohorts.map((errorCohort) =>
        errorCohort.cohort.unwrap(JointDataset.IndexLabel)
      ),
      this.context.modelMetadata.modelType
    );

    // generate table contents for selected feature cohorts
    const featureBasedCohorts = generateOverlappingFeatureBasedCohorts(
      this.context.jointDataset,
      this.context.dataset,
      this.state.selectedFeatures
    );

    const featureBasedCohortLabeledStatistics = generateMetrics(
      this.context.jointDataset,
      featureBasedCohorts.map((errorCohort) =>
        errorCohort.cohort.unwrap(JointDataset.IndexLabel)
      ),
      this.context.modelMetadata.modelType
    );

    const featureSelectionLimitReached =
      this.state.selectedFeatures.length >= 2;
    const featureSelectionOptions: IDropdownOption[] =
      this.context.dataset.feature_names.map((feature_name, index) => {
        return {
          key: index,
          text: feature_name,
          disabled:
            featureSelectionLimitReached &&
            !this.state.selectedFeatures.includes(index)
        };
      });

    return (
      <Stack tokens={{ padding: "16px 40px 10px 40px", childrenGap: "10px" }}>
        <Text variant="medium">
          {localization.Interpret.ModelPerformance.helperText}
        </Text>
        {!this.props.showNewModelOverviewExperience && <OverallMetricChart />}
        {this.props.showNewModelOverviewExperience && (
          <>
            <Stack horizontal tokens={{ childrenGap: "20px" }}>
              <Dropdown
                placeholder={
                  localization.ModelAssessment.ModelOverview
                    .metricSelectionDropdownPlaceholder
                }
                label={
                  localization.ModelAssessment.ModelOverview.metricsDropdown
                }
                selectedKeys={this.state.selectedMetrics}
                options={selectableMetrics}
                onChange={this.onMetricSelectionChange}
                multiSelect
                styles={{ dropdown: { width: 400 } }}
              />
              <Dropdown
                componentRef={this.featureDropdownRef}
                placeholder={
                  localization.ModelAssessment.ModelOverview
                    .featureSelectionDropdownPlaceholder
                }
                label={
                  localization.ModelAssessment.ModelOverview.featuresDropdown
                }
                selectedKeys={this.state.selectedFeatures}
                options={featureSelectionOptions}
                onChange={this.onFeatureSelectionChange}
                multiSelect
                styles={{ dropdown: { width: 400 } }}
              />
            </Stack>
            <DatasetCohortStatsTable
              selectableMetrics={selectableMetrics}
              selectedMetrics={this.state.selectedMetrics}
            />
            <DisaggregatedAnalysisTable
              selectableMetrics={selectableMetrics}
              selectedMetrics={this.state.selectedMetrics}
              selectedFeatures={this.state.selectedFeatures}
              featureBasedCohorts={featureBasedCohorts}
              featureDropdownRef={this.featureDropdownRef}
            />
            <ChartConfigurationFlyout
              isOpen={this.state.chartConfigurationIsVisible}
              onDismissFlyout={() => {
                this.setState({ chartConfigurationIsVisible: false });
              }}
              datasetCohorts={this.context.errorCohorts}
              featureBasedCohorts={featureBasedCohorts}
              selectedDatasetCohorts={this.state.selectedDatasetCohorts}
              selectedFeatureBasedCohorts={
                this.state.selectedFeatureBasedCohorts
              }
              updateDatasetCohortSelection={(selectedDatasetCohorts) =>
                this.setState({ selectedDatasetCohorts })
              }
              updateFeatureBasedCohortSelection={(
                selectedFeatureBasedCohorts
              ) => this.setState({ selectedFeatureBasedCohorts })}
            />
            <Pivot>
              {this.context.modelMetadata.modelType === ModelTypes.Binary && (
                <PivotItem
                  headerText={
                    localization.ModelAssessment.ModelOverview
                      .probabilityDistributionPivotItem
                  }
                >
                  <ProbabilityDistributionChart
                    onChooseCohorts={this.onChooseCohorts}
                    datasetCohorts={this.context.errorCohorts}
                    featureBasedCohorts={featureBasedCohorts}
                    selectedDatasetCohorts={this.state.selectedDatasetCohorts}
                    selectedFeatureBasedCohorts={
                      this.state.selectedFeatureBasedCohorts
                    }
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
                  onChooseCohorts={this.onChooseCohorts}
                  selectableMetrics={selectableMetrics}
                  datasetCohorts={this.context.errorCohorts}
                  featureBasedCohorts={featureBasedCohorts}
                  datasetCohortStats={datasetCohortLabeledStatistics}
                  featureBasedCohortStats={featureBasedCohortLabeledStatistics}
                  selectedDatasetCohorts={this.state.selectedDatasetCohorts}
                  selectedFeatureBasedCohorts={
                    this.state.selectedFeatureBasedCohorts
                  }
                />
              </PivotItem>
            </Pivot>
          </>
        )}
      </Stack>
    );
  }

  private onChooseCohorts = () =>
    this.setState({ chartConfigurationIsVisible: true });

  private onMetricSelectionChange = (
    _: React.FormEvent<HTMLDivElement>,
    item?: IDropdownOption
  ): void => {
    if (item && item.selected !== undefined) {
      if (
        item.selected &&
        !this.state.selectedMetrics.includes(item.key.toString())
      ) {
        this.setState({
          selectedMetrics: this.state.selectedMetrics.concat([
            item.key.toString()
          ])
        });
      }
      if (
        !item.selected &&
        this.state.selectedMetrics.includes(item.key.toString())
      ) {
        let selectedMetrics = this.state.selectedMetrics;
        const unselectedMetricIndex = selectedMetrics.findIndex(
          (key) => key === item.key.toString()
        );
        // remove unselected metric
        selectedMetrics.splice(unselectedMetricIndex, 1);
        this.setState({
          selectedMetrics
        });
      }
    }
  };

  private onFeatureSelectionChange = (
    _: React.FormEvent<HTMLDivElement>,
    item?: IDropdownOption
  ): void => {
    if (item && item.selected !== undefined && typeof item.key === "number") {
      // technically we know it's only numbers but item.key has type string | number
      if (item.selected && !this.state.selectedFeatures.includes(item.key)) {
        this.setState({
          selectedFeatures: this.state.selectedFeatures.concat([
            item.key as number
          ])
        });
      }
      if (!item.selected && this.state.selectedFeatures.includes(item.key)) {
        let selectedFeatures = this.state.selectedFeatures;
        const unselectedFeatureIndex = selectedFeatures.findIndex(
          (key) => key === item.key
        );
        // remove unselected metric
        selectedFeatures.splice(unselectedFeatureIndex, 1);
        this.setState({
          selectedFeatures
        });
      }
    }
  };
}

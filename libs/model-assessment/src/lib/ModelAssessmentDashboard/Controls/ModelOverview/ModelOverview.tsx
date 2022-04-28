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
  classificationTask,
  FabricStyles,
  MulticlassClassificationMetrics,
  ErrorCohort,
  ILabeledStatistic
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import {
  Stack,
  Text,
  Pivot,
  PivotItem,
  IComboBox,
  IComboBoxOption,
  ComboBox,
  ActionButton,
  MessageBar,
  Toggle
} from "office-ui-fabric-react";
import React from "react";

import { ChartConfigurationFlyout } from "./ChartConfigurationFlyout";
import { DatasetCohortStatsTable } from "./DatasetCohortStatsTable";
import { DisaggregatedAnalysisTable } from "./DisaggregatedAnalysisTable";
import { generateOverlappingFeatureBasedCohorts } from "./DisaggregatedAnalysisUtils";
import { modelOverviewStyles } from "./ModelOverview.styles";
import { ModelOverviewMetricChart } from "./ModelOverviewMetricChart";
import { ProbabilityDistributionChart } from "./ProbabilityDistributionChart";
import { getSelectableMetrics } from "./StatsTableUtils";

interface IModelOverviewProps {
  showNewModelOverviewExperience: boolean;
}

interface IModelOverviewState {
  selectedMetrics: string[];
  selectedFeatures: number[];
  selectedDatasetCohorts?: number[];
  selectedFeatureBasedCohorts?: number[];
  chartConfigurationIsVisible: boolean;
  showHeatmapColors: boolean;
  datasetCohortViewIsVisible: boolean;
  datasetCohortChartIsVisible: boolean;
}

const datasetCohortViewPivotKey = "datasetCohortView";
const disaggregatedAnalysisPivotKey = "disaggregatedAnalysis";

export class ModelOverview extends React.Component<
  IModelOverviewProps,
  IModelOverviewState
> {
  public static contextType = ModelAssessmentContext;
  public context: React.ContextType<typeof ModelAssessmentContext> =
    defaultModelAssessmentContext;
  private featureComboBoxRef = React.createRef<IComboBox>();

  constructor(props: IModelOverviewProps) {
    super(props);
    this.state = {
      chartConfigurationIsVisible: false,
      datasetCohortChartIsVisible: true,
      datasetCohortViewIsVisible: true,
      selectedFeatures: [],
      selectedMetrics: [],
      showHeatmapColors: false
    };
  }

  public componentDidMount(): void {
    let defaultSelectedMetrics: string[] = [];
    if (this.context.dataset.task_type === classificationTask) {
      if (this.context.jointDataset.getModelType() === ModelTypes.Binary) {
        defaultSelectedMetrics = [
          BinaryClassificationMetrics.Accuracy,
          BinaryClassificationMetrics.FalsePositiveRate,
          BinaryClassificationMetrics.FalseNegativeRate,
          BinaryClassificationMetrics.SelectionRate
        ];
      } else {
        defaultSelectedMetrics = [MulticlassClassificationMetrics.Accuracy];
      }
    } else {
      // task_type === "regression"
      defaultSelectedMetrics = [
        RegressionMetrics.MeanAbsoluteError,
        RegressionMetrics.MeanSquaredError,
        RegressionMetrics.MeanPrediction
      ];
    }
    this.setState({
      selectedDatasetCohorts: this.context.errorCohorts.map(
        (_cohort, index) => {
          return index;
        }
      ),
      selectedMetrics: defaultSelectedMetrics
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

    const classNames = modelOverviewStyles();

    const selectableMetrics = getSelectableMetrics(
      this.context.dataset.task_type,
      this.context.jointDataset.getModelType() === ModelTypes.Multiclass
    );

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
      this.context.baseErrorCohort,
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
    const featureSelectionOptions: IComboBoxOption[] =
      this.context.dataset.feature_names.map((featureName, index) => {
        return {
          disabled:
            featureSelectionLimitReached &&
            !this.state.selectedFeatures.includes(index),
          key: index,
          text: featureName
        };
      });

    let chartCohorts: ErrorCohort[];
    let someCohortSelected: boolean;
    let selectedChartCohorts: number[];
    let labeledStatistics: ILabeledStatistic[][];
    if (this.state.datasetCohortChartIsVisible) {
      chartCohorts = this.context.errorCohorts;
      someCohortSelected =
        this.state.selectedDatasetCohorts !== undefined &&
        this.state.selectedDatasetCohorts.length > 0;
      selectedChartCohorts = this.state.selectedDatasetCohorts ?? [];
      labeledStatistics = datasetCohortLabeledStatistics;
    } else {
      chartCohorts = featureBasedCohorts;
      someCohortSelected =
        this.state.selectedFeatureBasedCohorts !== undefined &&
        this.state.selectedFeatureBasedCohorts.length > 0;
      selectedChartCohorts = this.state.selectedFeatureBasedCohorts ?? [];
      labeledStatistics = featureBasedCohortLabeledStatistics;
    }

    return (
      <Stack
        className={classNames.sectionStack}
        tokens={{ childrenGap: "10px" }}
      >
        <Text variant="medium" className={classNames.descriptionText}>
          {localization.Interpret.ModelPerformance.helperText}
        </Text>
        {!this.props.showNewModelOverviewExperience && <OverallMetricChart />}
        {this.props.showNewModelOverviewExperience && (
          <Stack tokens={{ childrenGap: "10px" }}>
            <Pivot onLinkClick={this.handleViewPivot}>
              <PivotItem
                headerText={
                  localization.ModelAssessment.ModelOverview
                    .dataCohortsChartSelectionHeader
                }
                itemKey={datasetCohortViewPivotKey}
              />
              <PivotItem
                headerText={
                  localization.ModelAssessment.ModelOverview
                    .disaggregatedAnalysisHeatmapHeader
                }
                itemKey={disaggregatedAnalysisPivotKey}
              />
            </Pivot>
            <Stack horizontal tokens={{ childrenGap: "10px" }}>
              <ComboBox
                placeholder={
                  localization.ModelAssessment.ModelOverview
                    .metricSelectionDropdownPlaceholder
                }
                label={
                  localization.ModelAssessment.ModelOverview.metricsDropdown
                }
                selectedKey={this.state.selectedMetrics}
                options={selectableMetrics}
                onChange={this.onMetricSelectionChange}
                multiSelect
                className={classNames.dropdown}
                styles={FabricStyles.limitedSizeMenuDropdown}
              />
              {!this.state.datasetCohortViewIsVisible && (
                <ComboBox
                  componentRef={this.featureComboBoxRef}
                  placeholder={
                    localization.ModelAssessment.ModelOverview
                      .featureSelectionDropdownPlaceholder
                  }
                  label={
                    localization.ModelAssessment.ModelOverview.featuresDropdown
                  }
                  selectedKey={this.state.selectedFeatures}
                  options={featureSelectionOptions}
                  onChange={this.onFeatureSelectionChange}
                  multiSelect
                  className={classNames.dropdown}
                  styles={FabricStyles.limitedSizeMenuDropdown}
                />
              )}
            </Stack>
            <Toggle
            label={
              localization.ModelAssessment.ModelOverview
                .visualDisplayToggleLabel
            }
            inlineLabel
            onChange={this.onVisualDisplayToggleChange}
          />
            {this.state.datasetCohortViewIsVisible ? (
              <DatasetCohortStatsTable
                selectableMetrics={selectableMetrics}
                selectedMetrics={this.state.selectedMetrics}
                showHeatmapColors={this.state.showHeatmapColors}
              />
            ) : (
              <>
                {this.state.selectedFeatures.length === 0 && (
                  <ActionButton
                    onClick={() => {
                      this.featureComboBoxRef.current?.focus(true);
                    }}
                  >
                    {
                      localization.ModelAssessment.ModelOverview
                        .disaggregatedAnalysisFeatureSelectionPlaceholder
                    }
                  </ActionButton>
                )}
                {this.state.selectedFeatures.length > 0 && (
                  <>
                    <Text className={classNames.generalText}>
                      {localization.formatString(
                        localization.ModelAssessment.ModelOverview
                          .disaggregatedAnalysisBaseCohortDislaimer,
                        this.context.baseErrorCohort.cohort.name
                      )}
                    </Text>
                    {this.context.baseErrorCohort.cohort.filters.length +
                      this.context.baseErrorCohort.cohort.compositeFilters
                        .length >
                      0 && (
                      <MessageBar>
                        {localization.formatString(
                          localization.ModelAssessment.ModelOverview
                            .disaggregatedAnalysisBaseCohortWarning,
                          localization.ErrorAnalysis.Cohort.defaultLabel,
                          this.context.baseErrorCohort.cohort.name
                        )}
                      </MessageBar>
                    )}
                  </>
                )}
                <DisaggregatedAnalysisTable
                  selectableMetrics={selectableMetrics}
                  selectedMetrics={this.state.selectedMetrics}
                  selectedFeatures={this.state.selectedFeatures}
                  featureBasedCohorts={featureBasedCohorts}
                  showHeatmapColors={this.state.showHeatmapColors}
                />
              </>
            )}
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
              updateCohortSelection={this.updateCohortSelection}
              datasetCohortViewIsSelected={
                this.state.datasetCohortChartIsVisible
              }
            />
            {someCohortSelected && (
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
                      cohorts={chartCohorts}
                      selectedCohorts={selectedChartCohorts}
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
                    cohorts={chartCohorts}
                    cohortStats={labeledStatistics}
                    selectedCohorts={selectedChartCohorts}
                  />
                </PivotItem>
              </Pivot>
            )}
          </Stack>
        )}
      </Stack>
    );
  }

  private onVisualDisplayToggleChange = (
    _event: React.MouseEvent<HTMLElement, MouseEvent>,
    checked?: boolean | undefined
  ) => {
    if (checked !== undefined) {
      this.setState({ showHeatmapColors: checked });
    }
  };

  private onChooseCohorts = () =>
    this.setState({ chartConfigurationIsVisible: true });

  private updateCohortSelection = (
    selectedDatasetCohorts: number[],
    selectedFeatureBasedCohorts: number[],
    datasetCohortChartIsSelected: boolean
  ) =>
    this.setState({
      chartConfigurationIsVisible: false,
      datasetCohortChartIsVisible: datasetCohortChartIsSelected,
      selectedDatasetCohorts,
      selectedFeatureBasedCohorts
    });

  private onMetricSelectionChange = (
    _: React.FormEvent<IComboBox>,
    item?: IComboBoxOption
  ): void => {
    if (item && item.selected !== undefined) {
      const metric = item.key.toString();
      if (item.selected && !this.state.selectedMetrics.includes(metric)) {
        this.setState({
          selectedMetrics: this.state.selectedMetrics.concat([metric])
        });
      }
      if (!item.selected && this.state.selectedMetrics.includes(metric)) {
        const selectedMetrics = this.state.selectedMetrics;
        const unselectedMetricIndex = selectedMetrics.findIndex(
          (key) => key === metric
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
    _: React.FormEvent<IComboBox>,
    item?: IComboBoxOption
  ): void => {
    if (item && item.selected !== undefined && typeof item.key === "number") {
      let newlySelectedFeatures = this.state.selectedFeatures;
      // technically we know it's only numbers but item.key has type string | number
      if (item.selected && !this.state.selectedFeatures.includes(item.key)) {
        newlySelectedFeatures = newlySelectedFeatures.concat([
          item.key as number
        ]);
      }
      if (!item.selected && this.state.selectedFeatures.includes(item.key)) {
        const unselectedFeatureIndex = newlySelectedFeatures.findIndex(
          (key) => key === item.key
        );
        // remove unselected feature
        newlySelectedFeatures.splice(unselectedFeatureIndex, 1);
      }
      const featureBasedCohorts = this.generateFeatureBasedCohorts(
        newlySelectedFeatures
      );
      this.setState({
        selectedFeatureBasedCohorts: featureBasedCohorts.map(
          (_, index) => index
        ),
        selectedFeatures: newlySelectedFeatures
      });
    }
  };

  private generateFeatureBasedCohorts(selectedFeatures: number[]) {
    return generateOverlappingFeatureBasedCohorts(
      this.context.baseErrorCohort,
      this.context.jointDataset,
      this.context.dataset,
      selectedFeatures
    );
  }

  private handleViewPivot = (item?: PivotItem | undefined): void => {
    if (item) {
      // The table and chart are handled with separate flags here
      // because users may still want to configure the chart differently
      // from the table. However, by default we present the chart matching
      // the table, i.e., if the dataset cohort view is chosen we show
      // the dataset cohort chart and if the disaggregated analysis view
      // is chosen we show the feature-based cohort chart.
      if (item.props.itemKey === datasetCohortViewPivotKey) {
        this.setState({
          datasetCohortChartIsVisible: true,
          datasetCohortViewIsVisible: true
        });
      }
      if (item.props.itemKey === disaggregatedAnalysisPivotKey) {
        this.setState({
          datasetCohortChartIsVisible: false,
          datasetCohortViewIsVisible: false
        });
      }
    }
  };
}

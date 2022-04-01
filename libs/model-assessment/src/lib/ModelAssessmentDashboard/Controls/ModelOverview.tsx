// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  MissingParametersPlaceholder,
  defaultModelAssessmentContext,
  ModelAssessmentContext,
  OverallMetricChart,
  BinaryClassificationMetrics,
  RegressionMetrics,
  HeatmapHighChart,
  ILabeledStatistic,
  JointDataset,
  generateMetrics,
  FilterMethods,
  ICompositeFilter,
  Operations,
  ErrorCohort,
  Cohort,
  getCompositeFilterString
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import { PointOptionsObject } from "highcharts";
import {
  ActionButton,
  Dropdown,
  IDropdownOption,
  Stack,
  Dialog,
  Text,
  DefaultButton,
  DialogFooter,
  PrimaryButton,
  Pivot,
  PivotItem,
  IDropdown
} from "office-ui-fabric-react";
import React from "react";

import { modelOverviewStyles } from "./ModelOverview.styles";
import { ModelOverviewMetricChart } from "./ModelOverviewMetricChart";
import { ProbabilityDistributionChart } from "./ProbabilityDistributionChart";

interface IModelOverviewProps {
  showNewModelOverviewExperience: boolean;
}

interface IModelOverviewState {
  selectedMetrics: string[];
  selectedFeatures: number[];
  isFeaturePickerLimitExceededDialogOpen: boolean;
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
      isFeaturePickerLimitExceededDialogOpen: false
    };
  }

  public componentDidMount(): void {
    let defaultSelectedMetrics: string[] = [];
    if (this.context.dataset.task_type === "classification") {
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
    this.setState({ selectedMetrics: defaultSelectedMetrics });
  }

  public render(): React.ReactNode {
    const classNames = modelOverviewStyles();
    if (!this.context.jointDataset.hasPredictedY) {
      return (
        <MissingParametersPlaceholder>
          {localization.Interpret.ModelPerformance.missingParameters}
        </MissingParametersPlaceholder>
      );
    }

    let selectableMetrics: IDropdownOption[] = [];
    if (this.context.dataset.task_type === "classification") {
      // TODO: what about multiclass classification?
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

    let datasetCohortItems = this.generateTable(
      this.context.errorCohorts,
      selectableMetrics,
      datasetCohortLabeledStatistics
    );

    // generate table contents for selected feature cohorts
    // TODO: restrict by current cohort
    const n_groups_per_feature = 3;
    let filters: ICompositeFilter[][] = [];
    this.state.selectedFeatures.forEach((feature_index) => {
      const feature_name = this.context.dataset.feature_names[feature_index];
      const feature_meta_name = JointDataset.DataLabelRoot + feature_index;
      if (this.context.dataset.categorical_features.includes(feature_name)) {
        const featureFilters = this.context.jointDataset.metaDict[
          feature_meta_name
        ].sortedCategoricalValues?.map((_category, category_index) => {
          return {
            arg: [category_index],
            column: feature_meta_name,
            method: FilterMethods.Includes
          };
        });
        if (featureFilters) {
          filters.push(featureFilters);
        }
      } else {
        let min = Number.MAX_SAFE_INTEGER;
        let max = Number.MIN_SAFE_INTEGER;
        this.context.dataset.features.forEach((instanceFeatures) => {
          const feature_value = instanceFeatures[feature_index];
          if (typeof feature_value !== "number") {
            return;
          }
          if (feature_value > max) {
            max = feature_value;
          }
          if (feature_value < min) {
            min = feature_value;
          }
        });
        if (
          min === Number.MAX_SAFE_INTEGER ||
          max === Number.MIN_SAFE_INTEGER
        ) {
          // TODO: should we have an error message for this?
          return;
        }
        const interval_width = (max - min) / n_groups_per_feature;
        let featureFilters: ICompositeFilter[] = [
          {
            // left-most bin
            arg: [min + interval_width],
            column: feature_meta_name,
            method: FilterMethods.LessThan
          }
        ];
        for (
          // middle bins
          let bin_index = 1;
          bin_index < n_groups_per_feature - 1;
          bin_index++
        ) {
          featureFilters.push({
            compositeFilters: [
              {
                arg: [min + interval_width * bin_index],
                column: feature_meta_name,
                method: FilterMethods.GreaterThanEqualTo
              },
              {
                arg: [min + interval_width * (bin_index + 1)],
                column: feature_meta_name,
                method: FilterMethods.LessThan
              }
            ],
            operation: Operations.And
          });
        }
        featureFilters.push({
          // right-most bin
          arg: [min + interval_width * (n_groups_per_feature - 1)],
          column: feature_meta_name,
          method: FilterMethods.GreaterThanEqualTo
        });
        filters.push(featureFilters);
      }
    });

    let featureBasedCohorts = this.generateCohortsCartesianProduct(filters)
      // filter the empty cohorts resulting from overlapping dimensions
      .filter((errorCohort) => errorCohort.cohortStats.totalCohort > 0);

    const featureBasedCohortLabeledStatistics = generateMetrics(
      this.context.jointDataset,
      featureBasedCohorts.map((errorCohort) =>
        errorCohort.cohort.unwrap(JointDataset.IndexLabel)
      ),
      this.context.modelMetadata.modelType
    );

    let featureBasedCohortItems = this.generateTable(
      featureBasedCohorts,
      selectableMetrics,
      featureBasedCohortLabeledStatistics
    );

    return (
      <div className={classNames.page}>
        {/* <div className={classNames.infoWithText}> */}
          <Text variant="medium">
            {localization.Interpret.ModelPerformance.helperText}
          </Text>
        {/* </div> */}
        {!this.props.showNewModelOverviewExperience && (
          <OverallMetricChart
            showMetricSummary={!this.props.showNewModelOverviewExperience}
          />
        )}
        {this.props.showNewModelOverviewExperience && (
          <>
            <Stack horizontal tokens={{ childrenGap: "20px" }}>
              <Dropdown
                placeholder="Select metrics to compare your cohorts."
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
                placeholder="Select features to use for a disaggregated analysis."
                label={
                  localization.ModelAssessment.ModelOverview.featuresDropdown
                }
                selectedKeys={this.state.selectedFeatures}
                options={this.context.dataset.feature_names.map(
                  (feature_name, index) => {
                    return { key: index, text: feature_name };
                  }
                )}
                onChange={this.onFeatureSelectionChange}
                multiSelect
                styles={{ dropdown: { width: 400 } }}
              />
              <Dialog
                hidden={!this.state.isFeaturePickerLimitExceededDialogOpen}
                onDismiss={() =>
                  this.setState({
                    isFeaturePickerLimitExceededDialogOpen: false
                  })
                }
                dialogContentProps={{
                  title: "Feature selection limit met",
                  closeButtonAriaLabel: "Close",
                  subText:
                    "Only two features can be selected at the same time. Please unselect one of the two selected features before selecting another one."
                }}
              >
                <DialogFooter>
                  <DefaultButton
                    onClick={() => {
                      this.setState({
                        isFeaturePickerLimitExceededDialogOpen: false,
                        selectedFeatures: []
                      });
                    }}
                    text="Reset feature selection"
                  />
                  <PrimaryButton
                    onClick={() => {
                      this.setState({
                        isFeaturePickerLimitExceededDialogOpen: false
                      });
                    }}
                    text="Cancel"
                  />
                </DialogFooter>
              </Dialog>
            </Stack>
            <HeatmapHighChart
              configOverride={{
                chart: { type: "heatmap", spacingLeft: 50 },
                title: {
                  text: localization.ModelAssessment.ModelOverview
                    .dataCohortsHeatmapHeader,
                  align: "left"
                },
                xAxis: {
                  categories: columns,
                  opposite: true
                },
                yAxis: {
                  categories: this.context.errorCohorts.map(
                    (errorCohort) => errorCohort.cohort.name
                  ),
                  labels: {
                    align: "left",
                    reserveSpace: true,
                    // format labels to cap the line length at 20 characters
                    formatter: function () {
                      return ModelOverview.wrapYAxisLabels(this.value, true);
                    }
                  }
                },
                series: [
                  {
                    name: "Metrics",
                    colorKey: "colorValue",
                    data: datasetCohortItems,
                    type: "heatmap",
                    dataLabels: {
                      enabled: true
                    },
                    borderWidth: 1
                  }
                ],
                colorAxis: {
                  min: 0,
                  max: 1,
                  minColor: "#FFFFFF",
                  maxColor: "#1634F6"
                },
                legend: {
                  enabled: false
                },
                tooltip: {
                  formatter: function () {
                    if (
                      this.point.y === undefined ||
                      this.point.value === undefined
                    ) {
                      return undefined;
                    }
                    if (this.point.x === 0) {
                      // Count column
                      return (
                        "Cohort " +
                        this.series["yAxis"].categories[this.point.y] +
                        " contains " +
                        this.point.value +
                        " instances."
                      );
                    } else {
                      // Metric columns

                      return (
                        "The model's " +
                        this.series["xAxis"].categories[
                          this.point.x
                        ].toLowerCase() +
                        " on cohort " +
                        this.series["yAxis"].categories[this.point.y] +
                        " is " +
                        this.point.value
                      );
                    }
                  }
                }
              }}
            />
            {this.state.selectedFeatures.length === 0 && (
              <ActionButton
                styles={{}}
                onClick={() => {
                  this.featureDropdownRef.current?.focus(true);
                }}
              >
                Select features and fairness metrics to generate the
                disaggregated analysis.
              </ActionButton>
            )}
            {this.state.selectedFeatures.length > 0 && (
              <HeatmapHighChart
                configOverride={{
                  chart: {
                    type: "heatmap",
                    height: featureBasedCohorts.length * 40 + 120
                  },
                  title: {
                    text: localization.ModelAssessment.ModelOverview
                      .disaggregatedAnalysisHeatmapHeader,
                    align: "left"
                  },
                  xAxis: {
                    categories: columns,
                    opposite: true
                  },
                  yAxis: {
                    categories: featureBasedCohorts.map(
                      (errorCohort) => errorCohort.cohort.name
                    ),
                    labels: {
                      align: "left",
                      reserveSpace: true,
                      // format labels to cap the line length at 20 characters
                      formatter: function () {
                        return ModelOverview.wrapYAxisLabels(this.value, false);
                      }
                    }
                  },
                  series: [
                    {
                      name: "Metrics",
                      colorKey: "colorValue",
                      data: featureBasedCohortItems,
                      type: "heatmap",
                      dataLabels: {
                        enabled: true
                      },
                      borderWidth: 1
                    }
                  ],
                  colorAxis: {
                    min: 0,
                    max: 1,
                    minColor: "#FFFFFF",
                    maxColor: "#1634F6"
                  },
                  legend: {
                    enabled: false
                  },
                  tooltip: {
                    formatter: function () {
                      if (
                        this.point.y === undefined ||
                        this.point.value === undefined
                      ) {
                        return undefined;
                      }
                      if (this.point.x === 0) {
                        // Count column
                        return (
                          "Cohort " +
                          this.series["yAxis"].categories[this.point.y] +
                          " contains " +
                          this.point.value +
                          " instances."
                        );
                      } else {
                        // Metric columns
                        return (
                          "The model's " +
                          this.series["xAxis"].categories[
                            this.point.x
                          ].toLowerCase() +
                          " on cohort " +
                          this.series["yAxis"].categories[this.point.y] +
                          " is " +
                          this.point.value
                        );
                      }
                    }
                  }
                }}
              />
            )}

            <Pivot>
              <PivotItem headerText={"Probability distribution"}>
                <ProbabilityDistributionChart
                  datasetCohorts={this.context.errorCohorts}
                  featureBasedCohorts={featureBasedCohorts}
                />
              </PivotItem>
              <PivotItem headerText={"Metrics visualizations"}>
                <ModelOverviewMetricChart
                  selectableMetrics={selectableMetrics}
                  datasetCohorts={this.context.errorCohorts}
                  featureBasedCohorts={featureBasedCohorts}
                  datasetCohortStats={datasetCohortLabeledStatistics}
                  featureBasedCohortStats={featureBasedCohortLabeledStatistics}
                />
              </PivotItem>
            </Pivot>
          </>
        )}
      </div>
    );
  }

  private generateTable(
    cohorts: ErrorCohort[],
    selectableMetrics: IDropdownOption[],
    labeledStatistics: ILabeledStatistic[][]
  ) {
    let items: PointOptionsObject[] = cohorts.map(
      (errorCohort, cohortIndex) => {
        return {
          x: 0, // metric index for Count column
          y: cohortIndex,
          value: errorCohort.cohortStats.totalCohort,
          colorValue: 0
        };
      }
    );
    selectableMetrics
      .filter((element: IDropdownOption) =>
        this.state.selectedMetrics.includes(element.key.toString())
      )
      .forEach((metricOption: IDropdownOption, metricIndex: number) => {
        // first determine min and max values
        let metricMin = Number.MAX_SAFE_INTEGER;
        let metricMax = Number.MIN_SAFE_INTEGER;
        cohorts.forEach((_errorCohort, cohortIndex) => {
          const stat = labeledStatistics[cohortIndex].find(
            (stat) => stat.key === metricOption.key
          );
          if (stat) {
            if (stat.stat > metricMax) {
              metricMax = stat.stat;
            }
            if (stat.stat < metricMin) {
              metricMin = stat.stat;
            }
          }
        });
        // use min and max to normalize the colors
        const metricMinMaxDiff = metricMax - metricMin;
        cohorts.forEach((_errorCohort, cohortIndex) => {
          const stat = labeledStatistics[cohortIndex].find(
            (stat) => stat.key === metricOption.key
          );
          if (stat && !Number.isNaN(stat.stat)) {
            items.push({
              x: metricIndex + 1,
              y: cohortIndex,
              value: Number(stat.stat.toFixed(3)),
              colorValue: (stat.stat - metricMin) / metricMinMaxDiff
            });
          } else {
            // not a numeric value (NaN), so just put null
            items.push({
              x: metricIndex + 1,
              y: cohortIndex,
              value: Number.NaN,
              color: "#808080" // gray
            });
          }
        });
      });
    return items;
  }

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
        if (this.state.selectedFeatures.length >= 2) {
          this.setState({ isFeaturePickerLimitExceededDialogOpen: true });
        } else {
          this.setState({
            selectedFeatures: this.state.selectedFeatures.concat([
              item.key as number
            ])
          });
        }
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

  private generateFiltersCartesianProduct(
    filters: ICompositeFilter[][]
  ): ICompositeFilter[] {
    if (filters.length == 0) {
      return [];
    }
    if (filters.length === 1) {
      // just flatten filters list
      return filters[0];
    }
    return this.generateFiltersCartesianProduct([
      filters[0]
        .map((filter0) => {
          return filters[1].map((filter1) => {
            return {
              compositeFilters: [filter0, filter1],
              operation: Operations.And
            } as ICompositeFilter;
          });
        })
        .reduce((list1, list2) => [...list1, ...list2]), // flatten
      ...filters.slice(2)
    ]);
  }

  private generateCohortsCartesianProduct(filters: ICompositeFilter[][]) {
    return this.generateFiltersCartesianProduct(filters).map(
      (compositeFilter) => {
        const cohort_name = getCompositeFilterString(
          [compositeFilter],
          this.context.jointDataset
        )[0];
        return new ErrorCohort(
          new Cohort(
            cohort_name,
            this.context.jointDataset,
            [],
            [compositeFilter]
          ),
          this.context.jointDataset
        );
      }
    );
  }

  static wrapYAxisLabels(obj: any, wrapOnWhitespace: boolean = false) {
    var label = obj.toString();
    for (let index = 20; index < label.length; index += 20) {
      // check if there are suitable spots for a linewrap
      // if not just wrap after 20 characters
      const closing_parenthesis = ") ";
      const opening_parenthesis = " (";
      const whitespace = " ";
      const searchString = label.slice(index - 10, index);
      if (searchString.includes(closing_parenthesis)) {
        index = label.indexOf(closing_parenthesis, index - 10) + 2;
      } else if (searchString.includes(opening_parenthesis)) {
        index = label.indexOf(opening_parenthesis, index - 10) + 1;
      } else if (wrapOnWhitespace && searchString.includes(whitespace)) {
        index = label.indexOf(whitespace, index - 10) + 1;
      }
      label =
        label.slice(0, index) + "<br />" + label.slice(index, label.length);
    }
    if (label.length > 40) {
      label = label.slice(0, 37) + "...";
    }
    return label;
  }
}

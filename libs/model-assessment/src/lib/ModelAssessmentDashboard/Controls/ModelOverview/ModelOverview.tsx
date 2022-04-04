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
  generateMetrics
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import {
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
    if (this.context.dataset.predicted_y === undefined) {
      return (
        <MissingParametersPlaceholder>
          {localization.Interpret.ModelPerformance.missingParameters}
        </MissingParametersPlaceholder>
      );
    }

    let selectableMetrics: IDropdownOption[] = [];
    if (this.context.dataset.task_type === "classification") {
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
                  title:
                    localization.ModelAssessment.ModelOverview
                      .featureSelectionLimitWarningTitle,
                  closeButtonAriaLabel: "Close",
                  subText:
                    localization.ModelAssessment.ModelOverview
                      .featureSelectionLimitWarningSubTitle
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
                    text={
                      localization.ModelAssessment.ModelOverview
                        .resetFeatureSelection
                    }
                  />
                  <PrimaryButton
                    onClick={() => {
                      this.setState({
                        isFeaturePickerLimitExceededDialogOpen: false
                      });
                    }}
                    text={
                      localization.ModelAssessment.ModelOverview
                        .cancelFeatureSelectionWarningDialog
                    }
                  />
                </DialogFooter>
              </Dialog>
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

            <Pivot>
              <PivotItem
                headerText={
                  localization.ModelAssessment.ModelOverview
                    .probabilityDistributionPivotItem
                }
              >
                <ProbabilityDistributionChart
                  datasetCohorts={this.context.errorCohorts}
                  featureBasedCohorts={featureBasedCohorts}
                />
              </PivotItem>
              <PivotItem
                headerText={
                  localization.ModelAssessment.ModelOverview
                    .metricsVisualizationsPivotItem
                }
              >
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
      </Stack>
    );
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
}

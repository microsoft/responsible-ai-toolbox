// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IComboBoxOption,
  IComboBox,
  ComboBox,
  Stack,
  Text,
  Pivot,
  PivotItem,
  ActionButton,
  MessageBar,
  Toggle
} from "@fluentui/react";
import {
  MissingParametersPlaceholder,
  defaultModelAssessmentContext,
  ModelAssessmentContext,
  BinaryClassificationMetrics,
  RegressionMetrics,
  generateMetrics,
  JointDataset,
  ModelTypes,
  MultilabelMetrics,
  ObjectDetectionMetrics,
  FluentUIStyles,
  MulticlassClassificationMetrics,
  ErrorCohort,
  ILabeledStatistic,
  ITelemetryEvent,
  IsMulticlass,
  TelemetryLevels,
  TelemetryEventName,
  DatasetTaskType,
  ImageClassificationMetrics,
  QuestionAnsweringMetrics,
  TotalCohortSamples
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import React from "react";

import { ChartConfigurationFlyout } from "./ChartConfigurationFlyout";
import { defaultNumberOfContinuousFeatureBins } from "./Constants";
import { DatasetCohortStatsTable } from "./DatasetCohortStatsTable";
import { DisaggregatedAnalysisTable } from "./DisaggregatedAnalysisTable";
import { generateOverlappingFeatureBasedCohorts } from "./DisaggregatedAnalysisUtils";
import { FeatureConfigurationFlyout } from "./FeatureConfigurationFlyout";
import { MetricConfigurationFlyout } from "./MetricConfigurationFlyout";
import { modelOverviewStyles } from "./ModelOverview.styles";
import { ModelOverviewChartPivot } from "./ModelOverviewChartPivot";
import { ObjectDetectionWidgets } from "./ObjectDetectionModelOverview";
import { getSelectableMetrics } from "./StatsTableUtils";

interface IModelOverviewProps {
  telemetryHook?: (message: ITelemetryEvent) => void;
  requestObjectDetectionMetrics?: (
    selectionIndexes: number[][],
    aggregateMethod: string,
    className: string,
    iouThreshold: number,
    objectDetectionCache: Map<string, [number, number, number]>
  ) => Promise<any[]>;
  requestQuestionAnsweringMetrics?: (
    selectionIndexes: number[][],
    questionAnsweringCache: Map<
      string,
      [number, number, number, number, number, number]
    >
  ) => Promise<any[]>;
}

interface IModelOverviewState {
  selectedMetrics: string[];
  selectedFeatures: number[];
  selectedFeaturesContinuousFeatureBins: { [featureIndex: number]: number };
  selectedDatasetCohorts?: number[];
  selectedFeatureBasedCohorts?: number[];
  chartConfigurationIsVisible: boolean;
  datasetCohortViewIsVisible: boolean;
  aggregateMethod: string;
  datasetCohortChartIsVisible: boolean;
  featureConfigurationIsVisible: boolean;
  metricConfigurationIsVisible: boolean;
  showHeatmapColors: boolean;
  datasetCohortLabeledStatistics: ILabeledStatistic[][];
  datasetBasedCohorts: ErrorCohort[];
  className: string;
  featureBasedCohortLabeledStatistics: ILabeledStatistic[][];
  featureBasedCohorts: ErrorCohort[];
  iouThreshold: number;
}

const datasetCohortViewPivotKey = "datasetCohortView";
const disaggregatedAnalysisPivotKey = "disaggregatedAnalysis";

export class ModelOverview extends React.Component<
  IModelOverviewProps,
  IModelOverviewState
> {
  public static contextType = ModelAssessmentContext;
  public questionAnsweringCache: Map<
    string,
    [number, number, number, number, number, number]
  > = new Map();
  public objectDetectionCache: Map<string, [number, number, number]> =
    new Map();
  public context: React.ContextType<typeof ModelAssessmentContext> =
    defaultModelAssessmentContext;
  private featureComboBoxRef = React.createRef<IComboBox>();

  public constructor(props: IModelOverviewProps) {
    super(props);

    this.state = {
      aggregateMethod:
        localization.ModelAssessment.ModelOverview.metricTypes.macro,
      chartConfigurationIsVisible: false,
      className: "",
      datasetBasedCohorts: [],
      datasetCohortChartIsVisible: true,
      datasetCohortLabeledStatistics: [],
      datasetCohortViewIsVisible: true,
      featureBasedCohortLabeledStatistics: [],
      featureBasedCohorts: [],
      featureConfigurationIsVisible: false,
      iouThreshold: 70,
      metricConfigurationIsVisible: false,
      selectedFeatures: [],
      selectedFeaturesContinuousFeatureBins: {},
      selectedMetrics: [],
      showHeatmapColors: true
    };
  }

  public componentDidMount(): void {
    let defaultSelectedMetrics: string[] = [];
    if (
      this.context.dataset.task_type === DatasetTaskType.Classification ||
      this.context.dataset.task_type === DatasetTaskType.TextClassification ||
      this.context.dataset.task_type === DatasetTaskType.ImageClassification
    ) {
      if (this.context.jointDataset.getModelType() === ModelTypes.Binary) {
        defaultSelectedMetrics = [
          BinaryClassificationMetrics.Accuracy,
          BinaryClassificationMetrics.FalsePositiveRate,
          BinaryClassificationMetrics.FalseNegativeRate,
          BinaryClassificationMetrics.SelectionRate
        ];
      } else if (
        this.context.dataset.task_type === DatasetTaskType.ImageClassification
      ) {
        defaultSelectedMetrics = [
          ImageClassificationMetrics.Accuracy,
          ImageClassificationMetrics.MacroF1,
          ImageClassificationMetrics.MacroPrecision,
          ImageClassificationMetrics.MacroRecall
        ];
      } else {
        defaultSelectedMetrics = [MulticlassClassificationMetrics.Accuracy];
      }
    } else if (
      this.context.dataset.task_type ===
        DatasetTaskType.MultilabelImageClassification ||
      this.context.dataset.task_type ===
        DatasetTaskType.MultilabelTextClassification
    ) {
      defaultSelectedMetrics = [
        MultilabelMetrics.ExactMatchRatio,
        MultilabelMetrics.HammingScore
      ];
    } else if (
      this.context.dataset.task_type === DatasetTaskType.ObjectDetection
    ) {
      defaultSelectedMetrics = [
        ObjectDetectionMetrics.MeanAveragePrecision,
        ObjectDetectionMetrics.AveragePrecision,
        ObjectDetectionMetrics.AverageRecall
      ];
    } else if (
      this.context.dataset.task_type === DatasetTaskType.QuestionAnswering
    ) {
      defaultSelectedMetrics = [
        QuestionAnsweringMetrics.ExactMatchRatio,
        QuestionAnsweringMetrics.F1Score,
        QuestionAnsweringMetrics.BertScore
      ];
    } else {
      // task_type === "regression"
      defaultSelectedMetrics = [
        RegressionMetrics.MeanAbsoluteError,
        RegressionMetrics.MeanSquaredError,
        RegressionMetrics.MeanPrediction
      ];
    }
    this.setState(
      {
        selectedDatasetCohorts: this.context.errorCohorts.map((errorCohort) => {
          return errorCohort.cohort.getCohortID();
        }),
        selectedMetrics: defaultSelectedMetrics
      },
      () =>
        this.state.datasetCohortChartIsVisible
          ? this.updateDatasetCohortStats()
          : this.updateFeatureCohortStats()
    );
  }

  public componentDidUpdate(): void {
    const newDatasetCohortIDs = this.context.errorCohorts.map((errorCohort) => {
      return errorCohort.cohort.getCohortID();
    });
    const oldDatasetCohortIDs = this.state.datasetBasedCohorts.map(
      (errorCohort) => {
        return errorCohort.cohort.getCohortID();
      }
    );
    if (!this.ifCohortIndexesEquals(newDatasetCohortIDs, oldDatasetCohortIDs)) {
      const addCohortIDs = newDatasetCohortIDs.filter(
        (x) => !oldDatasetCohortIDs.includes(x)
      );
      const deleteCohortIDs = oldDatasetCohortIDs.filter(
        (x) => !newDatasetCohortIDs.includes(x)
      );
      if (addCohortIDs.length > 0) {
        this.setState(
          {
            selectedDatasetCohorts:
              this.state.selectedDatasetCohorts?.concat(addCohortIDs)
          },
          () => this.updateDatasetCohortStats()
        );
      } else if (deleteCohortIDs.length > 0) {
        this.setState(
          {
            selectedDatasetCohorts: this.state.selectedDatasetCohorts?.filter(
              (x) => !deleteCohortIDs.includes(x)
            )
          },
          () => this.updateDatasetCohortStats()
        );
      }
    }
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
          this.state.selectedMetrics.includes(element.key.toString())
        )
        .map((element) => {
          return element.text;
        })
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

    return (
      <Stack
        className={classNames.sectionStack}
        tokens={{ childrenGap: "10px" }}
        id="ModelOverview"
      >
        <Stack tokens={{ childrenGap: "10px" }}>
          <Text
            variant="medium"
            className={classNames.topLevelDescriptionText}
            id="modelOverviewDescription"
          >
            {localization.ModelAssessment.ModelOverview.topLevelDescription}
          </Text>
          <Pivot
            onLinkClick={this.handleViewPivot}
            id="modelOverviewCohortViewSelector"
            overflowBehavior="menu"
          >
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
          {!this.state.datasetCohortViewIsVisible && (
            <Text className={classNames.descriptionText}>
              {
                localization.ModelAssessment.ModelOverview
                  .featureBasedViewDescription
              }
            </Text>
          )}
          <Stack
            horizontal
            tokens={{ childrenGap: "10px" }}
            className={classNames.selections}
          >
            <ComboBox
              id="modelOverviewMetricSelection"
              placeholder={
                localization.ModelAssessment.ModelOverview
                  .metricSelectionDropdownPlaceholder
              }
              label={localization.ModelAssessment.ModelOverview.metricsDropdown}
              selectedKey={this.state.selectedMetrics}
              options={selectableMetrics}
              onChange={this.onMetricSelectionChange}
              multiSelect
              className={classNames.dropdown}
              styles={FluentUIStyles.limitedSizeMenuDropdown}
            />
            <ActionButton
              className={classNames.configurationActionButton}
              onClick={this.onClickMetricsConfiguration}
              iconProps={{ iconName: "ColumnOptions" }}
            >
              {
                localization.ModelAssessment.ModelOverview
                  .helpMeChooseMetricsButton
              }
            </ActionButton>
            {this.context.dataset.task_type ===
              DatasetTaskType.ObjectDetection && (
              <ObjectDetectionWidgets
                classNames={classNames}
                dataset={this.context.dataset}
                setAggregateMethod={this.setAggregateMethod}
                setClassName={this.setClassName}
                setIoUThreshold={this.setIoUThreshold}
                updateDatasetCohortStats={this.updateDatasetCohortStats}
                updateFeatureCohortStats={this.updateFeatureCohortStats}
              />
            )}
          </Stack>
          {!this.state.datasetCohortViewIsVisible && (
            <Stack
              horizontal
              tokens={{ childrenGap: "10px" }}
              className={classNames.selections}
            >
              <ComboBox
                id="modelOverviewFeatureSelection"
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
                styles={FluentUIStyles.limitedSizeMenuDropdown}
              />
              <ActionButton
                id="modelOverviewFeatureConfigurationActionButton"
                className={classNames.configurationActionButton}
                onClick={this.onClickFeatureConfiguration}
                iconProps={{ iconName: "ColumnOptions" }}
              >
                {
                  localization.ModelAssessment.ModelOverview
                    .helpMeChooseFeaturesButton
                }
              </ActionButton>
            </Stack>
          )}
          {this.showHeatmap() && (
            <Toggle
              id="modelOverviewHeatmapVisualDisplayToggle"
              checked={this.state.showHeatmapColors}
              label={
                localization.ModelAssessment.ModelOverview
                  .visualDisplayToggleLabel
              }
              inlineLabel
              onChange={this.onVisualDisplayToggleChange}
            />
          )}
          {this.state.datasetCohortViewIsVisible ? (
            <DatasetCohortStatsTable
              datasetBasedCohorts={this.state.datasetBasedCohorts}
              labeledStatistics={this.state.datasetCohortLabeledStatistics}
              selectableMetrics={selectableMetrics}
              selectedMetrics={this.state.selectedMetrics}
              showHeatmapColors={this.state.showHeatmapColors}
            />
          ) : (
            <>
              {this.state.selectedFeatures.length === 0 && (
                <MissingParametersPlaceholder>
                  {
                    localization.ModelAssessment.ModelOverview
                      .disaggregatedAnalysisFeatureSelectionPlaceholder
                  }
                </MissingParametersPlaceholder>
              )}
              {this.state.selectedFeatures.length > 0 && (
                <>
                  <Text
                    className={classNames.generalSemiBoldText}
                    id="modelOverviewDisaggregatedAnalysisBaseCohortDisclaimer"
                  >
                    {localization.formatString(
                      localization.ModelAssessment.ModelOverview
                        .disaggregatedAnalysisBaseCohortDisclaimer,
                      this.context.baseErrorCohort.cohort.name
                    )}
                  </Text>
                  {this.context.baseErrorCohort.cohort.filters.length +
                    this.context.baseErrorCohort.cohort.compositeFilters
                      .length >
                    0 && (
                    <MessageBar
                      id="modelOverviewDisaggregatedAnalysisBaseCohortWarning"
                      className={classNames.descriptionText}
                    >
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
                labeledStatistics={
                  this.state.featureBasedCohortLabeledStatistics
                }
                selectableMetrics={selectableMetrics}
                selectedMetrics={this.state.selectedMetrics}
                selectedFeatures={this.state.selectedFeatures}
                featureBasedCohorts={this.state.featureBasedCohorts}
                showHeatmapColors={this.state.showHeatmapColors}
              />
            </>
          )}
          <ChartConfigurationFlyout
            isOpen={this.state.chartConfigurationIsVisible}
            onDismissFlyout={this.onDismissChartConfigurationFlyout}
            datasetCohorts={this.context.errorCohorts}
            featureBasedCohorts={this.state.featureBasedCohorts}
            selectedDatasetCohorts={this.state.selectedDatasetCohorts}
            selectedFeatureBasedCohorts={this.state.selectedFeatureBasedCohorts}
            updateCohortSelection={this.updateCohortSelection}
            datasetCohortViewIsSelected={this.state.datasetCohortChartIsVisible}
          />
          <FeatureConfigurationFlyout
            isOpen={this.state.featureConfigurationIsVisible}
            onDismissFlyout={this.onDismissFeatureConfigurationFlyout}
            selectedFeatures={this.state.selectedFeatures}
            numberOfContinuousFeatureBins={
              this.state.selectedFeaturesContinuousFeatureBins
            }
            updateSelectedFeatures={this.onFeatureConfigurationChange}
          />
          <MetricConfigurationFlyout
            isOpen={this.state.metricConfigurationIsVisible}
            onDismissFlyout={(): void => {
              this.setState({ metricConfigurationIsVisible: false });
            }}
            selectedMetrics={this.state.selectedMetrics}
            updateSelectedMetrics={this.onMetricConfigurationChange}
            selectableMetrics={selectableMetrics}
          />
          {this.shouldRenderModelOverviewChartPivot() && (
            <ModelOverviewChartPivot
              onChooseCohorts={this.onChooseCohorts}
              telemetryHook={this.props.telemetryHook}
              allCohorts={
                this.state.datasetCohortChartIsVisible
                  ? this.state.datasetBasedCohorts
                  : this.state.featureBasedCohorts
              }
              selectedChartCohorts={
                this.state.datasetCohortChartIsVisible
                  ? this.state.selectedDatasetCohorts ?? []
                  : this.state.selectedFeatureBasedCohorts ?? []
              }
              showDatasetBasedCohorts={this.state.datasetCohortChartIsVisible}
              labeledStatistics={
                this.state.datasetCohortChartIsVisible
                  ? this.state.datasetCohortLabeledStatistics
                  : this.state.featureBasedCohortLabeledStatistics
              }
              selectedMetrics={this.state.selectedMetrics}
            />
          )}
        </Stack>
      </Stack>
    );
  }

  private showHeatmap(): boolean {
    // only show heatmap toggle if there are multiple cohorts since there won't be a color gradient otherwise.
    const showHeatmapToggleInDatasetCohortView =
      this.state.datasetCohortViewIsVisible &&
      this.context.errorCohorts.length > 1;
    const showHeatmapToggleInFeatureCohortView =
      !this.state.datasetCohortViewIsVisible &&
      this.state.selectedFeatures.length > 0 &&
      this.state.featureBasedCohorts.length > 1;

    return (
      (showHeatmapToggleInDatasetCohortView ||
        showHeatmapToggleInFeatureCohortView) &&
      // excluding object detection scenario
      this.context.dataset.task_type !== DatasetTaskType.ObjectDetection
    );
  }

  private shouldRenderModelOverviewChartPivot(): boolean {
    return (
      (!this.state.datasetCohortChartIsVisible &&
        this.state.selectedFeatureBasedCohorts !== undefined &&
        this.state.selectedFeatureBasedCohorts.length > 0) ||
      (this.state.datasetCohortChartIsVisible &&
        this.state.selectedDatasetCohorts !== undefined &&
        this.state.selectedDatasetCohorts.length > 0)
    );
  }

  private setAggregateMethod = (value: string): void => {
    this.setState({ aggregateMethod: value }, () => {
      if (this.state.datasetCohortChartIsVisible) {
        this.updateDatasetCohortStats();
      } else {
        this.updateFeatureCohortStats();
      }
    });

    this.logButtonClick(
      TelemetryEventName.ModelOverviewMetricsSelectionUpdated
    );
  };

  private setClassName = (value: string): void => {
    this.setState({ className: value }, () => {
      if (this.state.datasetCohortChartIsVisible) {
        this.updateDatasetCohortStats();
      } else {
        this.updateFeatureCohortStats();
      }
    });

    this.logButtonClick(
      TelemetryEventName.ModelOverviewMetricsSelectionUpdated
    );
  };

  private setIoUThreshold = (value: number): void => {
    this.setState({ iouThreshold: value }, () => {
      if (this.state.datasetCohortChartIsVisible) {
        this.updateDatasetCohortStats();
      } else {
        this.updateFeatureCohortStats();
      }
    });

    this.logButtonClick(
      TelemetryEventName.ModelOverviewMetricsSelectionUpdated
    );
  };

  private updateDatasetCohortStats = (): void => {
    const selectionIndexes: number[][] = this.context.errorCohorts.map(
      (errorCohort) => errorCohort.cohort.unwrap(JointDataset.IndexLabel)
    );
    const datasetCohortMetricStats = generateMetrics(
      this.context.jointDataset,
      selectionIndexes,
      this.context.modelMetadata.modelType,
      this.objectDetectionCache,
      [
        this.state.aggregateMethod,
        this.state.className,
        this.state.iouThreshold
      ],
      this.questionAnsweringCache
    );

    this.setState({
      datasetBasedCohorts: this.context.errorCohorts,
      datasetCohortLabeledStatistics: datasetCohortMetricStats
    });

    if (this.context.modelMetadata.modelType === ModelTypes.ObjectDetection) {
      this.updateObjectDetectionMetrics(selectionIndexes, true);
    } else if (
      this.context.modelMetadata.modelType === ModelTypes.QuestionAnswering
    ) {
      this.updateQuestionAnsweringMetrics(selectionIndexes, true);
    }
  };

  private updateObjectDetectionMetrics(
    selectionIndexes: number[][],
    isDatasetCohort: boolean
  ): void {
    if (
      this.context.requestObjectDetectionMetrics &&
      selectionIndexes.length > 0 &&
      this.state.aggregateMethod.length > 0 &&
      this.state.className.length > 0 &&
      this.state.iouThreshold
    ) {
      this.context
        .requestObjectDetectionMetrics(
          selectionIndexes,
          this.state.aggregateMethod,
          this.state.className,
          this.state.iouThreshold,
          this.objectDetectionCache,
          new AbortController().signal
        )
        .then((result) => {
          const [allCohortMetrics, cohortClasses] = result;

          // Assumption: the lengths of `allCohortMetrics` and `selectionIndexes` are the same.
          const updatedMetricStats: ILabeledStatistic[][] = [];

          for (const [
            cohortIndex,
            cohortMetrics
          ] of allCohortMetrics.entries()) {
            const count = selectionIndexes[cohortIndex].length;

            let meanAveragePrecision = -1;
            let averagePrecision = -1;
            let averageRecall = -1;

            // checking 2D array of computed metrics to cache
            if (
              Array.isArray(cohortMetrics) &&
              cohortMetrics.every((subArray) => Array.isArray(subArray))
            ) {
              for (const [i, cohortMetric] of cohortMetrics.entries()) {
                const [mAP, aP, aR] = cohortMetric;

                const key: [number[], string, string, number] = [
                  selectionIndexes[cohortIndex],
                  this.state.aggregateMethod,
                  cohortClasses[i],
                  this.state.iouThreshold
                ];
                if (!this.objectDetectionCache.has(key.toString())) {
                  this.objectDetectionCache.set(key.toString(), [mAP, aP, aR]);
                }

                if (this.state.className === cohortClasses[i]) {
                  [meanAveragePrecision, averagePrecision, averageRecall] =
                    cohortMetric;
                }
              }
            } else if (Array.isArray(cohortMetrics)) {
              [meanAveragePrecision, averagePrecision, averageRecall] =
                cohortMetrics;
            }

            const updatedCohortMetricStats = [
              {
                key: TotalCohortSamples,
                label: localization.Interpret.Statistics.samples,
                stat: count
              },
              {
                key: ObjectDetectionMetrics.MeanAveragePrecision,
                label: localization.Interpret.Statistics.meanAveragePrecision,
                stat: meanAveragePrecision
              },
              {
                key: ObjectDetectionMetrics.AveragePrecision,
                label: localization.Interpret.Statistics.averagePrecision,
                stat: averagePrecision
              },
              {
                key: ObjectDetectionMetrics.AverageRecall,
                label: localization.Interpret.Statistics.averageRecall,
                stat: averageRecall
              }
            ];

            updatedMetricStats.push(updatedCohortMetricStats);
          }

          isDatasetCohort
            ? this.updateDatasetCohortState(updatedMetricStats)
            : this.updateFeatureCohortState(updatedMetricStats);
        });
    }
  }

  private updateQuestionAnsweringMetrics(
    selectionIndexes: number[][],
    isDatasetCohort: boolean
  ): void {
    if (
      this.context.requestQuestionAnsweringMetrics &&
      selectionIndexes.length > 0
    ) {
      this.context
        .requestQuestionAnsweringMetrics(
          selectionIndexes,
          this.questionAnsweringCache,
          new AbortController().signal
        )
        .then((result) => {
          // Assumption: the lengths of `result` and `selectionIndexes` are the same.
          const updatedMetricStats: ILabeledStatistic[][] = [];

          for (const [
            cohortIndex,
            [
              exactMatchRatio,
              f1Score,
              meteorScore,
              bleuScore,
              bertScore,
              rougeScore
            ]
          ] of result.entries()) {
            const count = selectionIndexes[cohortIndex].length;

            if (
              !this.questionAnsweringCache.has(
                selectionIndexes[cohortIndex].toString()
              )
            ) {
              this.questionAnsweringCache.set(
                selectionIndexes[cohortIndex].toString(),
                [
                  exactMatchRatio,
                  f1Score,
                  meteorScore,
                  bleuScore,
                  bertScore,
                  rougeScore
                ]
              );
            }

            const updatedCohortMetricStats = [
              {
                key: TotalCohortSamples,
                label: localization.Interpret.Statistics.samples,
                stat: count
              },
              {
                key: QuestionAnsweringMetrics.ExactMatchRatio,
                label: localization.Interpret.Statistics.exactMatchRatio,
                stat: exactMatchRatio
              },
              {
                key: QuestionAnsweringMetrics.F1Score,
                label: localization.Interpret.Statistics.f1Score,
                stat: f1Score
              },
              {
                key: QuestionAnsweringMetrics.MeteorScore,
                label: localization.Interpret.Statistics.meteorScore,
                stat: meteorScore
              },
              {
                key: QuestionAnsweringMetrics.BleuScore,
                label: localization.Interpret.Statistics.bleuScore,
                stat: bleuScore
              },
              {
                key: QuestionAnsweringMetrics.BertScore,
                label: localization.Interpret.Statistics.bertScore,
                stat: bertScore
              },
              {
                key: QuestionAnsweringMetrics.RougeScore,
                label: localization.Interpret.Statistics.rougeScore,
                stat: rougeScore
              }
            ];

            updatedMetricStats.push(updatedCohortMetricStats);
          }

          isDatasetCohort
            ? this.updateDatasetCohortState(updatedMetricStats)
            : this.updateFeatureCohortState(updatedMetricStats);
        });
    }
  }

  private updateDatasetCohortState(
    cohortMetricStats: ILabeledStatistic[][]
  ): void {
    this.setState({
      datasetCohortLabeledStatistics: cohortMetricStats
    });
  }

  private updateFeatureCohortStats = async (): Promise<void> => {
    // generate table contents for selected feature cohorts
    const featureBasedCohorts = generateOverlappingFeatureBasedCohorts(
      this.context.baseErrorCohort,
      this.context.jointDataset,
      this.context.dataset,
      this.state.selectedFeatures,
      this.state.selectedFeaturesContinuousFeatureBins
    );

    const selectionIndexes: number[][] = featureBasedCohorts.map(
      (errorCohort) => errorCohort.cohort.unwrap(JointDataset.IndexLabel)
    );

    const featureCohortMetricStats = generateMetrics(
      this.context.jointDataset,
      selectionIndexes,
      this.context.modelMetadata.modelType,
      this.objectDetectionCache,
      [
        this.state.aggregateMethod,
        this.state.className,
        this.state.iouThreshold
      ],
      this.questionAnsweringCache
    );

    this.setState({
      featureBasedCohortLabeledStatistics: featureCohortMetricStats,
      featureBasedCohorts
    });

    if (this.context.modelMetadata.modelType === ModelTypes.ObjectDetection) {
      this.updateObjectDetectionMetrics(selectionIndexes, false);
    } else if (
      this.context.modelMetadata.modelType === ModelTypes.QuestionAnswering
    ) {
      this.updateQuestionAnsweringMetrics(selectionIndexes, false);
    }
  };

  private updateFeatureCohortState(
    cohortMetricStats: ILabeledStatistic[][]
  ): void {
    this.setState({
      featureBasedCohortLabeledStatistics: cohortMetricStats
    });
  }

  private ifCohortIndexesEquals(a: number[], b: number[]): boolean {
    return (
      Array.isArray(a) &&
      Array.isArray(b) &&
      a.length === b.length &&
      a.every((val, index) => val === b[index])
    );
  }

  private onClickMetricsConfiguration = (): void => {
    this.setState({ metricConfigurationIsVisible: true });
    this.logButtonClick(
      TelemetryEventName.ModelOverviewMetricsConfigurationClick
    );
  };

  private onClickFeatureConfiguration = (): void => {
    this.setState({ featureConfigurationIsVisible: true });
    this.logButtonClick(
      TelemetryEventName.ModelOverviewFeatureConfigurationClick
    );
  };

  private onDismissFeatureConfigurationFlyout = (): void => {
    this.setState({ featureConfigurationIsVisible: false });
  };

  private onVisualDisplayToggleChange = (
    _event: React.MouseEvent<HTMLElement, MouseEvent>,
    checked?: boolean | undefined
  ): void => {
    if (checked !== undefined) {
      this.setState({ showHeatmapColors: checked });
      this.logButtonClick(
        TelemetryEventName.ModelOverviewShowHeatmapToggleUpdated
      );
    }
  };

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
      this.logButtonClick(
        TelemetryEventName.ModelOverviewMetricsSelectionUpdated
      );
    }
  };

  private onFeatureConfigurationChange = (
    newSelectedFeatures: number[],
    numberOfContinuousFeatureBins: {
      [featureIndex: number]: number;
    }
  ): void => {
    const featureBasedCohorts = this.generateFeatureBasedCohorts(
      newSelectedFeatures,
      numberOfContinuousFeatureBins
    );
    this.setState(
      {
        featureConfigurationIsVisible: false,
        selectedFeatureBasedCohorts: featureBasedCohorts.map(
          (_, index) => index
        ),
        selectedFeatures: newSelectedFeatures,
        selectedFeaturesContinuousFeatureBins: numberOfContinuousFeatureBins
      },
      () => this.updateFeatureCohortStats()
    );
  };

  private onMetricConfigurationChange = (metrics: string[]): void => {
    this.setState({
      metricConfigurationIsVisible: false,
      selectedMetrics: metrics
    });
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
      const numberOfContinuousFeatureBins: {
        [featureIndex: number]: number;
      } = {};
      newlySelectedFeatures.forEach((featureIndex) => {
        numberOfContinuousFeatureBins[featureIndex] =
          this.state.selectedFeaturesContinuousFeatureBins[featureIndex] ??
          defaultNumberOfContinuousFeatureBins;
      });
      const featureBasedCohorts = this.generateFeatureBasedCohorts(
        newlySelectedFeatures,
        numberOfContinuousFeatureBins
      );
      this.setState(
        {
          selectedFeatureBasedCohorts: featureBasedCohorts.map(
            (_, index) => index
          ),
          selectedFeatures: newlySelectedFeatures,
          selectedFeaturesContinuousFeatureBins: numberOfContinuousFeatureBins
        },
        () => this.updateFeatureCohortStats()
      );
    }
  };

  private generateFeatureBasedCohorts = (
    selectedFeatures: number[],
    numberOfContinuousFeatureBins: { [featureIndex: number]: number }
  ): ErrorCohort[] => {
    return generateOverlappingFeatureBasedCohorts(
      this.context.baseErrorCohort,
      this.context.jointDataset,
      this.context.dataset,
      selectedFeatures,
      numberOfContinuousFeatureBins
    );
  };

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
        this.logButtonClick(
          TelemetryEventName.ModelOverviewDatasetCohortsTabClick
        );
      }
      if (item.props.itemKey === disaggregatedAnalysisPivotKey) {
        this.setState({
          datasetCohortChartIsVisible: false,
          datasetCohortViewIsVisible: false
        });
        this.logButtonClick(
          TelemetryEventName.ModelOverviewFeatureCohortsTabClick
        );
      }
    }
  };

  private logButtonClick = (eventName: TelemetryEventName): void => {
    this.props.telemetryHook?.({
      level: TelemetryLevels.ButtonClick,
      type: eventName
    });
  };

  private updateCohortSelection = (
    selectedDatasetCohorts: number[],
    selectedFeatureBasedCohorts: number[],
    datasetCohortChartIsSelected: boolean
  ): void => {
    this.setState({
      chartConfigurationIsVisible: false,
      datasetCohortChartIsVisible: datasetCohortChartIsSelected,
      selectedDatasetCohorts,
      selectedFeatureBasedCohorts
    });
  };

  private onDismissChartConfigurationFlyout = (): void => {
    this.setState({ chartConfigurationIsVisible: false });
  };

  private onChooseCohorts = (): void =>
    this.setState({ chartConfigurationIsVisible: true });
}

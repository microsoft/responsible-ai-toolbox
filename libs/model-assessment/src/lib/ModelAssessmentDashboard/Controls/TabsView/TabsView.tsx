// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  DefaultEffects,
  IObjectWithKey,
  PivotItem,
  Stack,
  Text
} from "@fluentui/react";
import {
  CausalAnalysisOptions,
  CausalInsightsTab
} from "@responsible-ai/causality";
import {
  WeightVectorOption,
  WeightVectors,
  ModelAssessmentContext,
  defaultModelAssessmentContext,
  IModelAssessmentContext,
  IsClassifier,
  DatasetTaskType,
  featureColumnsExist,
  dataBalanceExperienceFlight,
  isFlightActive
} from "@responsible-ai/core-ui";
import { CounterfactualsTab } from "@responsible-ai/counterfactuals";
import {
  DataAnalysisTab,
  DataAnalysisTabOptions
} from "@responsible-ai/dataset-explorer";
import {
  ErrorAnalysisOptions,
  ErrorAnalysisViewTab,
  InfoCallout,
  MapShift,
  MatrixArea,
  MatrixFilter,
  TreeViewRenderer
} from "@responsible-ai/error-analysis";
import { ForecastingDashboard as ForecastingTab } from "@responsible-ai/forecasting";
import { VisionExplanationDashboard as VisionTab } from "@responsible-ai/interpret-vision";
import { localization } from "@responsible-ai/localization";
import { Dictionary } from "lodash";
import * as React from "react";

import { AddTabButton } from "../../AddTabButton";
import { GlobalTabKeys } from "../../ModelAssessmentEnums";
import {
  FeatureImportancesTab,
  FeatureImportancesTabOptions
} from "../FeatureImportances";
import { ModelOverview } from "../ModelOverview/ModelOverview";

import {
  causalAnalysisIconId,
  counterfactualIconId,
  dataAnalysisIconId,
  errorAnalysisIconId,
  featureImportanceIconId,
  modelOverviewIconId
} from "./constants";
import { tabsViewStyles } from "./TabsView.styles";
import { ITabsViewProps } from "./TabsViewProps";
import { getInfo } from "./utils";

export interface ITabsViewState {
  allSelectedItems: IObjectWithKey[];
  errorAnalysisOption: ErrorAnalysisOptions;
  importances: number[];
  mapShiftErrorAnalysisOption: ErrorAnalysisOptions;
  mapShiftVisible: boolean;
  selectedFeatures: string[];
  selectedWeightVector: WeightVectorOption;
  weightVectorLabels: Dictionary<string>;
  weightVectorOptions: WeightVectorOption[];
  featureImportanceOption: FeatureImportancesTabOptions;
  dataAnalysisOption: DataAnalysisTabOptions;
  causalAnalysisOption: CausalAnalysisOptions;
}

export class TabsView extends React.PureComponent<
  ITabsViewProps,
  ITabsViewState
> {
  public static contextType = ModelAssessmentContext;
  public context: IModelAssessmentContext = defaultModelAssessmentContext;

  public constructor(props: ITabsViewProps) {
    super(props);
    const weightVectorLabels = {
      [WeightVectors.AbsAvg]: localization.Interpret.absoluteAverage
    };
    const weightVectorOptions = [];
    if (IsClassifier(props.modelMetadata.modelType)) {
      weightVectorOptions.push(WeightVectors.AbsAvg);
    }
    props.modelMetadata.classNames.forEach((name, index) => {
      weightVectorLabels[index] = localization.formatString(
        localization.Interpret.WhatIfTab.classLabel,
        name
      );
      weightVectorOptions.push(index);
    });
    const importances = props.errorAnalysisData?.[0]?.importances ?? [];
    this.state = {
      allSelectedItems: [],
      causalAnalysisOption: CausalAnalysisOptions.Aggregate,
      dataAnalysisOption: DataAnalysisTabOptions.TableView,
      errorAnalysisOption: ErrorAnalysisOptions.TreeMap,
      featureImportanceOption: FeatureImportancesTabOptions.GlobalExplanation,
      importances,
      mapShiftErrorAnalysisOption: ErrorAnalysisOptions.TreeMap,
      mapShiftVisible: false,
      selectedFeatures: props.dataset.feature_names,
      selectedWeightVector: IsClassifier(props.modelMetadata.modelType)
        ? WeightVectors.AbsAvg
        : 0,
      weightVectorLabels,
      weightVectorOptions
    };
    if (
      this.props.requestImportances &&
      this.context.dataset.task_type !== DatasetTaskType.Forecasting
    ) {
      this.props
        .requestImportances([], new AbortController().signal)
        .then((result) => {
          this.setState({ importances: result });
        });
    }
  }

  public render(): React.ReactNode {
    const disabledView =
      this.props.requestDebugML === undefined &&
      this.props.requestMatrix === undefined &&
      !this.props.baseCohort.isAllDataCohort;
    const classNames = tabsViewStyles();
    return (
      <Stack className={classNames.stackStyle}>
        {this.props.activeGlobalTabs[0]?.key !==
          GlobalTabKeys.ErrorAnalysisTab &&
          this.context.dataset.task_type !== DatasetTaskType.Forecasting && (
            <Stack.Item className={classNames.buttonSection}>
              <AddTabButton
                tabIndex={0}
                onAdd={this.props.addTab}
                availableTabs={this.props.addTabDropdownOptions}
              />
            </Stack.Item>
          )}
        {this.props.activeGlobalTabs.map((t, i) => (
          <>
            <Stack.Item
              key={i}
              className={classNames.section}
              styles={{ root: { boxShadow: DefaultEffects.elevation4 } }}
            >
              {t.key === GlobalTabKeys.VisionTab &&
                this.props.dataset.images &&
                this.props.dataset.predicted_y &&
                this.props.dataset.class_names && (
                  <>
                    <div className={classNames.sectionHeader}>
                      <Text variant={"xxLarge"}>
                        {localization.ModelAssessment.ComponentNames.VisionTab}
                      </Text>
                    </div>
                    <VisionTab
                      dataSummary={{
                        class_names: this.props.dataset.class_names,
                        feature_names: this.props.dataset.feature_names,
                        features: this.props.dataset.features,
                        images: this.props.dataset.images,
                        predicted_y: this.props.dataset.predicted_y,
                        task_type: this.props.dataset.task_type,
                        true_y: this.props.dataset.true_y
                      }}
                      requestExp={this.props.requestExp}
                      requestObjectDetectionMetrics={
                        this.props.requestObjectDetectionMetrics
                      }
                      cohorts={this.props.cohorts}
                      setSelectedCohort={this.props.setSelectedCohort}
                      selectedCohort={this.props.selectedCohort}
                    />
                  </>
                )}
              {t.key === GlobalTabKeys.ForecastingTab && (
                <>
                  <Text
                    variant={"xxLarge"}
                    className={classNames.sectionHeader}
                    id="forecastingHeader"
                  >
                    {featureColumnsExist(
                      this.context.dataset.feature_names,
                      this.context.dataset.feature_metadata
                    )
                      ? localization.Forecasting.whatIfForecastingHeader
                      : localization.Forecasting.forecastHeader}
                  </Text>
                  <ForecastingTab />
                </>
              )}
              {t.key === GlobalTabKeys.ErrorAnalysisTab &&
                this.context.dataset.task_type !==
                  DatasetTaskType.Forecasting &&
                this.props.errorAnalysisData?.[0] && (
                  <>
                    <Stack
                      className={classNames.sectionHeader}
                      id="errorAnalysisHeader"
                    >
                      <Text variant={"xxLarge"}>
                        {
                          localization.ModelAssessment.ComponentNames
                            .ErrorAnalysis
                        }
                      </Text>
                      <div className={classNames.sectionTooltip}>
                        <InfoCallout
                          iconId={errorAnalysisIconId}
                          infoText={
                            getInfo(
                              t.key,
                              this.props,
                              this.state.errorAnalysisOption
                            ).body
                          }
                          title={
                            getInfo(
                              t.key,
                              this.props,
                              this.state.errorAnalysisOption
                            ).title
                          }
                        />
                      </div>
                    </Stack>
                    <ErrorAnalysisViewTab
                      disabledView={disabledView}
                      tree={this.props.errorAnalysisData[0].tree}
                      matrix={this.props.errorAnalysisData[0].matrix}
                      matrixFeatures={
                        this.props.errorAnalysisData[0].matrix_features
                      }
                      messages={this.props.stringParams?.contextualHelp}
                      getTreeNodes={this.props.requestDebugML}
                      getMatrix={this.props.requestMatrix}
                      updateSelectedCohort={this.props.updateSelectedCohort}
                      features={
                        this.props.errorAnalysisData[0].tree_features ||
                        this.props.dataset.feature_names
                      }
                      selectedFeatures={this.state.selectedFeatures}
                      errorAnalysisOption={this.state.errorAnalysisOption}
                      selectedCohort={this.props.selectedCohort}
                      baseCohort={this.props.baseCohort}
                      selectFeatures={(features: string[]): void =>
                        this.setState({ selectedFeatures: features })
                      }
                      importances={this.state.importances}
                      onClearCohortSelectionClick={(): void => {
                        this.props.onClearCohortSelectionClick();
                      }}
                      onSaveCohortClick={(): void => {
                        this.props.setSaveCohortVisible();
                      }}
                      showCohortName={false}
                      handleErrorDetectorChanged={
                        this.handleErrorDetectorChanged
                      }
                      selectedKey={this.state.errorAnalysisOption}
                      telemetryHook={this.props.telemetryHook}
                    />
                  </>
                )}
              {t.key === GlobalTabKeys.ModelOverviewTab && (
                <>
                  <Stack className={classNames.sectionHeader}>
                    <Text variant={"xxLarge"} id="modelStatisticsHeader">
                      {
                        localization.ModelAssessment.ComponentNames
                          .ModelOverview
                      }
                    </Text>
                    <div className={classNames.sectionTooltip}>
                      <InfoCallout
                        iconId={modelOverviewIconId}
                        infoText={
                          localization.ModelAssessment.ModelOverview
                            .topLevelDescription
                        }
                        title={
                          localization.ModelAssessment.ModelOverview.infoTitle
                        }
                      />
                    </div>
                  </Stack>
                  <ModelOverview telemetryHook={this.props.telemetryHook} />
                </>
              )}
              {t.key === GlobalTabKeys.DataAnalysisTab && (
                <>
                  <Stack className={classNames.sectionHeader}>
                    <Text variant={"xxLarge"} id="dataAnalysisHeader">
                      {localization.ModelAssessment.ComponentNames.DataAnalysis}
                    </Text>
                    {this.state.dataAnalysisOption !==
                      DataAnalysisTabOptions.DataBalance && (
                      <div className={classNames.sectionTooltip}>
                        <InfoCallout
                          iconId={dataAnalysisIconId}
                          infoText={
                            getInfo(
                              t.key,
                              this.props,
                              undefined,
                              this.state.dataAnalysisOption
                            ).body
                          }
                          title={
                            getInfo(
                              t.key,
                              this.props,
                              undefined,
                              this.state.dataAnalysisOption
                            ).title
                          }
                        />
                      </div>
                    )}
                  </Stack>
                  <DataAnalysisTab
                    telemetryHook={this.props.telemetryHook}
                    showDataBalanceExperience={isFlightActive(
                      dataBalanceExperienceFlight,
                      this.context.featureFlights
                    )}
                    onAllSelectedItemsChange={this.onAllSelectedItemsChange}
                    onPivotChange={this.onDataAnalysisOptionChange}
                  />
                </>
              )}
              {t.key === GlobalTabKeys.FeatureImportancesTab &&
                this.props.modelExplanationData?.[0] && (
                  <>
                    <Stack className={classNames.sectionHeader}>
                      <Text variant={"xxLarge"} id="featureImportanceHeader">
                        {
                          localization.ModelAssessment.ComponentNames
                            .FeatureImportances
                        }
                      </Text>
                      {this.state.featureImportanceOption ===
                        FeatureImportancesTabOptions.GlobalExplanation && (
                        <div className={classNames.sectionTooltip}>
                          <InfoCallout
                            iconId={featureImportanceIconId}
                            infoText={
                              localization.Interpret.GlobalTab.helperText
                            }
                            title={localization.Interpret.GlobalTab.infoTitle}
                          />
                        </div>
                      )}
                    </Stack>
                    <FeatureImportancesTab
                      allSelectedItems={this.state.allSelectedItems}
                      modelMetadata={this.props.modelMetadata}
                      modelExplanationData={this.props.modelExplanationData}
                      selectedWeightVector={this.state.selectedWeightVector}
                      weightVectorOptions={this.state.weightVectorOptions}
                      weightVectorLabels={this.state.weightVectorLabels}
                      requestPredictions={this.props.requestPredictions}
                      onWeightVectorChange={this.onWeightVectorChange}
                      telemetryHook={this.props.telemetryHook}
                      onPivotChange={this.onFeatureImportanceOptionChange}
                    />
                  </>
                )}
              {t.key === GlobalTabKeys.CausalAnalysisTab &&
                this.props.causalAnalysisData?.[0] && (
                  <>
                    <Stack
                      className={classNames.sectionHeader}
                      id="causalAnalysisHeader"
                    >
                      <Text variant={"xxLarge"} id="causalInsightsTab">
                        {
                          localization.ModelAssessment.ComponentNames
                            .CausalAnalysis
                        }
                      </Text>
                      <div className={classNames.sectionTooltip}>
                        <InfoCallout
                          iconId={causalAnalysisIconId}
                          infoText={
                            getInfo(
                              t.key,
                              this.props,
                              undefined,
                              undefined,
                              this.state.causalAnalysisOption
                            ).body
                          }
                          title={
                            getInfo(
                              t.key,
                              this.props,
                              undefined,
                              undefined,
                              this.state.causalAnalysisOption
                            ).title
                          }
                        />
                      </div>
                    </Stack>
                    <CausalInsightsTab
                      data={this.props.causalAnalysisData?.[0]}
                      newCohort={this.props.selectedCohort}
                      telemetryHook={this.props.telemetryHook}
                      onPivotChange={this.onCausalAnalysisOptionChange}
                    />
                  </>
                )}

              {t.key === GlobalTabKeys.CounterfactualsTab &&
                this.props.counterfactualData?.[0] && (
                  <>
                    <Stack className={classNames.sectionHeader}>
                      <Text variant={"xxLarge"}>
                        {
                          localization.ModelAssessment.ComponentNames
                            .Counterfactuals
                        }
                      </Text>
                      <div className={classNames.sectionTooltip}>
                        <InfoCallout
                          iconId={counterfactualIconId}
                          infoText={
                            localization.Counterfactuals.whatifDescription
                          }
                          title={localization.Common.infoTitle}
                        />
                      </div>
                    </Stack>
                    <CounterfactualsTab
                      data={this.props.counterfactualData?.[0]}
                      telemetryHook={this.props.telemetryHook}
                    />
                  </>
                )}
            </Stack.Item>
            {this.context.dataset.task_type !== DatasetTaskType.Forecasting && (
              <Stack.Item className={classNames.buttonSection}>
                <AddTabButton
                  tabIndex={i + 1}
                  onAdd={this.props.addTab}
                  availableTabs={this.props.addTabDropdownOptions}
                />
              </Stack.Item>
            )}
          </>
        ))}
        {this.state.mapShiftVisible && (
          <MapShift
            currentOption={this.state.mapShiftErrorAnalysisOption}
            isOpen={this.state.mapShiftVisible}
            onDismiss={(): void =>
              this.setState({
                errorAnalysisOption: this.state.errorAnalysisOption,
                mapShiftVisible: false
              })
            }
            onSave={(): void => {
              this.setState({
                mapShiftVisible: false
              });
              this.props.setSaveCohortVisible();
            }}
            onShift={(): void => {
              // reset all states on shift
              MatrixFilter.resetState();
              MatrixArea.resetState();
              TreeViewRenderer.resetState();
              this.setState({
                errorAnalysisOption: this.state.mapShiftErrorAnalysisOption,
                mapShiftVisible: false
              });
              this.props.setSelectedCohort(this.props.baseCohort);
            }}
          />
        )}
      </Stack>
    );
  }

  private onFeatureImportanceOptionChange = (
    option: FeatureImportancesTabOptions
  ): void => {
    this.setState({ featureImportanceOption: option });
  };

  private onDataAnalysisOptionChange = (
    option: DataAnalysisTabOptions
  ): void => {
    this.setState({ dataAnalysisOption: option });
  };

  private onCausalAnalysisOptionChange = (
    option: CausalAnalysisOptions
  ): void => {
    this.setState({ causalAnalysisOption: option });
  };

  private onWeightVectorChange = (weightOption: WeightVectorOption): void => {
    this.props.jointDataset.buildLocalFlattenMatrix(weightOption);
    this.props.cohorts.forEach((errorCohort) =>
      errorCohort.cohort.clearCachedImportances()
    );
    this.setState({ selectedWeightVector: weightOption });
  };

  private onAllSelectedItemsChange = (
    allSelectedItems: IObjectWithKey[]
  ): void => {
    this.setState({ allSelectedItems });
  };

  private handleErrorDetectorChanged = (item?: PivotItem): void => {
    if (item && item.props.itemKey) {
      // Note comparison below is actually string comparison (key is string), we have to set the enum
      if (item.props.itemKey === ErrorAnalysisOptions.HeatMap) {
        const selectedOptionHeatMap = ErrorAnalysisOptions.HeatMap;
        this.setErrorDetector(selectedOptionHeatMap);
      } else {
        const selectedOptionTreeMap = ErrorAnalysisOptions.TreeMap;
        this.setErrorDetector(selectedOptionTreeMap);
      }
    }
  };

  private setErrorDetector = (key: ErrorAnalysisOptions): void => {
    if (this.props.selectedCohort.isTemporary) {
      this.setState({
        mapShiftErrorAnalysisOption: key,
        mapShiftVisible: true
      });
    } else {
      this.setState({
        errorAnalysisOption: key
      });
    }
  };
}

// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export enum TelemetryEventName {
  // Core
  NewAxisConfigSelected = "RAI_NewAxisConfigSelected",
  // Cohort
  NewCohortAdded = "RAI_NewCohortAdded",
  // Main menu
  MainMenuCohortSettingsClick = "RAI_MainMenuCohortSettingsClick",
  MainMenuDashboardConfigurationClick = "RAI_MainMenuDashboardConfigurationClick",
  MainMenuSwitchCohortClick = "RAI_MainMenuSwitchCohortClick",
  MainMenuNewCohortClick = "RAI_MainMenuNewCohortClick",
  // Error analysis
  ErrorAnalysisTreeMapTabClick = "RAI_ErrorAnalysisTreeMapTabClick",
  ErrorAnalysisTreeMapFeatureListClick = "RAI_ErrorAnalysisTreeMapFeatureListClick",
  ErrorAnalysisTreeMapClearSelection = "RAI_ErrorAnalysisTreeMapClearSelection",
  ErrorAnalysisTreeMapSaveAsNewCohortClick = "RAI_ErrorAnalysisTreeMapSaveAsNewCohortClick",
  ErrorAnalysisTreeMapCohortSaved = "RAI_ErrorAnalysisTreeMapCohortSaved",
  ErrorAnalysisHeatMapTabClick = "RAI_ErrorAnalysisHeatMapTabClick",
  ErrorAnalysisHeatMapQuantileBinningClick = "RAI_ErrorAnalysisHeatMapQuantileBinningClick",
  ErrorAnalysisNewMetricSelected = "RAI_ErrorAnalysisNewMetricSelected",
  // Model overview
  ModelOverviewDatasetCohortsTabClick = "RAI_ModelOverviewDatasetCohortsTabClick",
  ModelOverviewFeatureCohortsTabClick = "RAI_ModelOverviewFeatureCohortsTabClick",
  ModelOverviewMetricsConfigurationClick = "RAI_ModelOverviewMetricsConfigurationClick",
  ModelOverviewFeatureConfigurationClick = "RAI_ModelOverviewFeatureConfigurationClick",
  ModelOverviewMetricsSelectionUpdated = "RAI_ModelOverviewMetricsSelectionUpdated",
  ModelOverviewShowHeatmapToggleUpdated = "RAI_ModelOverviewShowHeatmapToggleUpdated",
  ModelOverviewSplineChartToggleUpdated = "RAI_ModelOverviewSplineChartToggleUpdated",
  // Data analysis
  DataBalanceTabSelected = "RAI_DataBalanceTabSelected",
  DatasetExplorerTabSelected = "RAI_DatasetExplorerTabSelected",
  DatasetExplorerNewCohortSelected = "RAI_DatasetExplorerNewCohortSelected",
  DatasetExplorerNewChartTypeSelected = "RAI_DatasetExplorerNewChartTypeSelected",
  TableViewTabSelected = "RAI_TableViewTabSelected",
  // Feature importances
  AggregateFeatureImportanceTabClick = "RAI_AggregateFeatureImportanceTabClick",
  IndividualFeatureImportanceTabClick = "RAI_IndividualFeatureImportanceTabClick",
  AggregateFeatureImportanceNewDependenceSelected = "RAI_AggregateFeatureImportanceNewDependenceSelected",
  IndividualFeatureImportanceSelectedDatapointsUpdated = "RAI_IndividualFeatureImportanceSelectedDatapointsUpdated",
  IndividualFeatureImportanceFeatureImportancePlotClick = "RAI_IndividualFeatureImportanceFeatureImportancePlotClick",
  IndividualFeatureImportanceICEPlotClick = "RAI_IndividualFeatureImportanceICEPlotClick",
  FeatureImportancesWhatDoValuesMeanCalloutClick = "RAI_FeatureImportancesWhatDoValuesMeanCalloutClick",
  FeatureImportancesCrossClassWeightsCalloutClick = "RAI_FeatureImportancesCrossClassWeightsCalloutClick",
  FeatureImportancesHowToReadChartCalloutClick = "RAI_FeatureImportancesHowToReadChartCalloutClick",
  FeatureImportancesNewDatapointSelectedFromChart = "RAI_FeatureImportancesNewDatapointSelectedFromChart",
  // Counterfactual
  CounterfactualNewDatapointSelectedFromChart = "RAI_CounterfactualNewDatapointSelectedFromChart",
  CounterfactualNewDatapointSelectedFromDropdown = "RAI_CounterfactualNewDatapointSelectedFromDropdown",
  CounterfactualCreateWhatIfCounterfactualClick = "RAI_CounterfactualCreateWhatIfCounterfactualClick",
  CounterfactualSaveAsNewDatapointClick = "RAI_CounterfactualSaveAsNewDatapointClick",
  CounterfactualListSetValueClick = "RAI_CounterfactualListSetValueClick",
  // Causal analysis
  AggregateCausalTabClick = "RAI_AggregateCausalTabClick",
  AggregateCausalWhyIncludeConfoundingFeaturesCalloutClick = "RAI_AggregateCausalWhyIncludeConfoundingFeaturesCalloutClick",
  IndividualCausalTabClick = "RAI_IndividualCausalTabClick",
  IndividualCausalWhyIncludeConfoundingFeaturesCalloutClick = "RAI_IndividualCausalWhyIncludeConfoundingFeaturesCalloutClick",
  IndividualCausalSelectedDatapointUpdatedFromChart = "RAI_IndividualCausalSelectedDatapointUpdatedFromChart",
  IndividualCausalSelectedDatapointUpdatedFromDropdown = "RAI_IndividualCausalSelectedDatapointUpdatedFromDropdown",
  CausalTreatmentPolicyTabClick = "RAI_CausalTreatmentPolicyTabClick",
  CausalTreatmentPolicyNewTreatmentFeatureSelected = "RAI_CausalTreatmentPolicyNewTreatmentFeatureSelected",
  LocalCausalEffectsFetchError = "LocalCausalEffectsFetchError",
  LocalCausalEffectsFetchSuccess = "LocalCausalEffectsFetchSuccess",
  // Big data
  CounterfactualsBubblePlotDataFetch = "CounterfactualsBubblePlotDataFetch",
  CausalBubblePlotDataFetch = "CausalBubblePlotDataFetch",
  FeatureImportanceBubblePlotDataFetch = "FeatureImportanceBubblePlotDataFetch",
  DataAnalysisBubblePlotDataFetch = "DataAnalysisBubblePlotDataFetch",
  BubblePlotDataFetchError = "BubblePlotDataFetchError",
  BubblePlotDataFetchSuccess = "BubblePlotDataFetchSuccess",
  LocalExplanationsFetchSuccess = "LocalExplanationsFetchSuccess",
  LocalExplanationsFetchError = "LocalExplanationsFetchError",
  LocalCounterfactualsFetchSuccess = "LocalCounterfactualsFetchSuccess",
  LocalCounterfactualsFetchError = "LocalCounterfactualsFetchError",
  ViewBubblePlotButtonClicked = "ViewBubblePlotButtonClicked"
}

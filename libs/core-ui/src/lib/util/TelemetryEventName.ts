// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export enum TelemetryEventName {
  // Core
  NewAxisConfigSelected = "NewAxisConfigSelected",
  // Cohort
  NewCohortAdded = "NewCohortAdded",
  // Main menu
  MainMenuCohortSettingsClick = "MainMenuCohortSettingsClick",
  MainMenuDashboardConfigurationClick = "MainMenuDashboardConfigurationClick",
  MainMenuSwitchCohortClick = "MainMenuSwitchCohortClick",
  MainMenuNewCohortClick = "MainMenuNewCohortClick",
  // Error analysis
  ErrorAnalysisTreeMapTabClick = "ErrorAnalysisTreeMapTabClick",
  ErrorAnalysisTreeMapFeatureListClick = "ErrorAnalysisTreeMapFeatureListClick",
  ErrorAnalysisTreeMapClearSelection = "ErrorAnalysisTreeMapClearSelection",
  ErrorAnalysisTreeMapSaveAsNewCohortClick = "ErrorAnalysisTreeMapSaveAsNewCohortClick",
  ErrorAnalysisTreeMapCohortSaved = "ErrorAnalysisTreeMapCohortSaved",
  ErrorAnalysisHeatMapTabClick = "ErrorAnalysisHeatMapTabClick",
  ErrorAnalysisHeatMapQuantileBinningClick = "ErrorAnalysisHeatMapQuantileBinningClick",
  ErrorAnalysisNewMetricSelected = "ErrorAnalysisNewMetricSelected",
  // Model overview
  ModelOverviewDatasetCohortsTabClick = "ModelOverviewDatasetCohortsTabClick",
  ModelOverviewFeatureCohortsTabClick = "ModelOverviewFeatureCohortsTabClick",
  ModelOverviewMetricsConfigurationClick = "ModelOverviewMetricsConfigurationClick",
  ModelOverviewFeatureConfigurationClick = "ModelOverviewFeatureConfigurationClick",
  ModelOverviewMetricsSelectionUpdated = "ModelOverviewMetricsSelectionUpdated",
  ModelOverviewShowHeatmapToggleUpdated = "ModelOverviewShowHeatmapToggleUpdated",
  ModelOverviewSplineChartToggleUpdated = "ModelOverviewSplineChartToggleUpdated",
  // Dataset explorer
  DatasetExplorerNewCohortSelected = "DatasetExplorerNewCohortSelected",
  DatasetExplorerNewChartTypeSelected = "DatasetExplorerNewChartTypeSelected",
  // Feature importances
  AggregateFeatureImportanceTabClick = "AggregateFeatureImportanceTabClick",
  IndividualFeatureImportanceTabClick = "IndividualFeatureImportanceTabClick",
  AggregateFeatureImportanceNewDependenceSelected = "AggregateFeatureImportanceNewDependenceSelected",
  FeatureImportancesWhatDoValuesMeanCalloutClick = "FeatureImportancesWhatDoValuesMeanCalloutClick",
  FeatureImportancesCrossClassWeightsCalloutClick = "FeatureImportancesCrossClassWeightsCalloutClick",
  FeatureImportancesHowToReadChartCalloutClick = "FeatureImportancesHowToReadChartCalloutClick",
  // Counterfactual
  // Causal analysis
  AggregateCausalWhyIncludeConfoundingFeaturesCalloutClick = "AggregateCausalWhyIncludeConfoundingFeaturesCalloutClick",
  IndividualCausalWhyIncludeConfoundingFeaturesCalloutClick = "IndividualCausalWhyIncludeConfoundingFeaturesCalloutClick"
}

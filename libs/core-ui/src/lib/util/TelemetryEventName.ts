// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export enum TelemetryEventName {
  // Error analysis
  ErrorAnalysisTreeMapTabClick = "ErrorAnalysisTreeMapTabClick",
  ErrorAnalysisTreeMapFeatureListClick = "ErrorAnalysisTreeMapFeatureListClick",
  ErrorAnalysisTreeMapClearSelection = "ErrorAnalysisTreeMapClearSelection",
  ErrorAnalysisTreeMapSaveAsNewCohortClick = "ErrorAnalysisTreeMapSaveAsNewCohortClick",
  ErrorAnalysisTreeMapCohortSaved = "ErrorAnalysisTreeMapCohortSaved",
  ErrorAnalysisHeatMapTabClick = "ErrorAnalysisHeatMapTabClick",
  ErrorAnalysisHeatMapQuantileBinningClick = "ErrorAnalysisHeatMapQuantileBinningClick",
  ErrorAnalysisNewMetricSelected = "ErrorAnalysisNewMetricSelected",
  // Main menu
  MainMenuCohortSettingsClick = "MainMenuCohortSettingsClick",
  MainMenuDashboardConfigurationClick = "MainMenuDashboardConfigurationClick",
  MainMenuSwitchCohortClick = "MainMenuSwitchCohortClick",
  MainMenuNewCohortClick = "MainMenuNewCohortClick",
  // Cohort
  NewCohortAdded = "NewCohortAdded",
  // Core
  NewAxisConfigSelected = "NewAxisConfigSelected",
  // Counterfactual
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
  DatasetExplorerNewChartTypeSelected = "DatasetExplorerNewChartTypeSelected"
}

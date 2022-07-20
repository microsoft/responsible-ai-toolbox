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
  ErrorAnalysisNewMetricSelected = "ErrorAnalysisNewMetricSelected",
  // Main menu
  MainMenuCohortSettingsClick = "MainMenuCohortSettingsClick",
  MainMenuDashboardConfigurationClick = "MainMenuDashboardConfigurationClick",
  MainMenuSwitchCohortClick = "MainMenuSwitchCohortClick",
  MainMenuNewCohortClick = "MainMenuNewCohortClick",
  // Cohort
  NewCohortAdded = "NewCohortAdded"
  // Counterfactual
}

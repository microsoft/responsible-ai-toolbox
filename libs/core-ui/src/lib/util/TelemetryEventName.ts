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
  // Data analysis
  DataBalanceTabSelected = "DataBalanceTabSelected",
  DatasetExplorerTabSelected = "DatasetExplorerTabSelected",
  DatasetExplorerNewCohortSelected = "DatasetExplorerNewCohortSelected",
  DatasetExplorerNewChartTypeSelected = "DatasetExplorerNewChartTypeSelected",
  // Feature importances
  AggregateFeatureImportanceTabClick = "AggregateFeatureImportanceTabClick",
  IndividualFeatureImportanceTabClick = "IndividualFeatureImportanceTabClick",
  AggregateFeatureImportanceNewDependenceSelected = "AggregateFeatureImportanceNewDependenceSelected",
  IndividualFeatureImportanceSelectedDatapointsUpdated = "IndividualFeatureImportanceSelectedDatapointsUpdated",
  IndividualFeatureImportanceFeatureImportancePlotClick = "IndividualFeatureImportanceFeatureImportancePlotClick",
  IndividualFeatureImportanceICEPlotClick = "IndividualFeatureImportanceICEPlotClick",
  FeatureImportancesWhatDoValuesMeanCalloutClick = "FeatureImportancesWhatDoValuesMeanCalloutClick",
  FeatureImportancesCrossClassWeightsCalloutClick = "FeatureImportancesCrossClassWeightsCalloutClick",
  FeatureImportancesHowToReadChartCalloutClick = "FeatureImportancesHowToReadChartCalloutClick",
  // Counterfactual
  CounterfactualNewDatapointSelectedFromChart = "CounterfactualNewDatapointSelectedFromChart",
  CounterfactualNewDatapointSelectedFromDropdown = "CounterfactualNewDatapointSelectedFromDropdown",
  CounterfactualCreateWhatIfCounterfactualClick = "CounterfactualCreateWhatIfCounterfactualClick",
  CounterfactualSaveAsNewDatapointClick = "CounterfactualSaveAsNewDatapointClick",
  CounterfactualListSetValueClick = "CounterfactualListSetValueClick",
  // Causal analysis
  AggregateCausalTabClick = "AggregateCausalTabClick",
  AggregateCausalWhyIncludeConfoundingFeaturesCalloutClick = "AggregateCausalWhyIncludeConfoundingFeaturesCalloutClick",
  IndividualCausalTabClick = "IndividualCausalTabClick",
  IndividualCausalWhyIncludeConfoundingFeaturesCalloutClick = "IndividualCausalWhyIncludeConfoundingFeaturesCalloutClick",
  IndividualCausalSelectedDatapointUpdatedFromChart = "IndividualCausalSelectedDatapointUpdatedFromChart",
  IndividualCausalSelectedDatapointUpdatedFromDropdown = "IndividualCausalSelectedDatapointUpdatedFromDropdown",
  CasualTreatmentPolicyTabClick = "CasualTreatmentPolicyTabClick",
  CasualTreatmentPolicyNewTreatmentFeatureSelected = "CasualTreatmentPolicyNewTreatmentFeatureSelected"
}

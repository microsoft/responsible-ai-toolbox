// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export enum Locators {
  ApplyButton = "button:contains('Apply')",
  CancelButton = "button:contains('Cancel')",
  YesButton = "button:contains('Yes')",
  SaveAsNewCohortButton = "button:contains('Save as a new cohort')",
  ClearSelectionButton = "button:contains('Clear selection')",
  IFIPredictionSpan = "span[class^='headerCount']", // IFI - Individual feature importance
  IFIContainer = "#IndividualFeatureImportanceView", // IFI - Individual feature importance
  IFICollapseButton = '#IndividualFeatureImportanceView button[class^="ms-GroupHeader-expand"]',
  IFITableRowSelected = '#IndividualFeatureImportanceView div[class^="ms-List-page"] div[class^="ms-DetailsRow"] div[class^="ms-Check is-checked"]',
  IFIDropdownSelectedOption = "div[class^='featureImportanceChartAndLegend']",
  IFIScrollableTable = "div[class*='tabularDataView'] div.ms-ScrollablePane div.ms-ScrollablePane--contentContainer",
  IFINumberOfBars = "#FeatureImportanceBar svg g.highcharts-series-group rect",
  IFIYAxisValue = '#FeatureImportanceBar div[class^="rotatedVerticalBox-"]',
  IFIXAxisValue = "#FeatureImportanceBar g.highcharts-xaxis-labels text",
  ICEPlot = '#subPlotChoice label:contains("ICE")', // ICE - Individual Conditional Expectation
  ICENoOfPoints = "#subPlotContainer svg g[class^='highcharts-series-group'] path",
  IFITopFeaturesText = "div[class^='featureImportanceControls'] span[class^='sliderLabel']",
  IFITopFeaturesValue = "div[class^='featureImportanceControls'] div.ms-Slider-container div.ms-Slider-slideBox",
  IFIAbsoluteValuesToggleButton = "div[class^='featureImportanceLegend'] div.ms-Toggle",
  ICEFeatureDropdown = "div[class^='featureImportanceLegend'] div[class^='ms-ComboBox-container'] button[class^='ms-Button ms-Button--icon ms-ComboBox-CaretDown-button']",
  ICEFeatureDropdownOption = "div[class^='featureImportanceLegend'] div[class^='ms-ComboBox-container'] button:contains('workclass')",
  ICEXAxisNewValue = "#subPlotContainer text[class^='highcharts-axis-title']",
  ICEToolTipButton = "#subPlotContainer button:contains('How to read this chart')",
  ICECalloutTitle = "#subPlotContainer div.ms-Callout-container span[class^='calloutTitle']",
  ICECalloutBody = "#subPlotContainer div.ms-Callout-container div[class^='calloutInner']",
  SortByDropdown = "#featureImportanceChartContainer div.ms-Dropdown-container",
  SortByDropdownOptions = "div[class^='dropdownItemsWrapper'] button:contains('CohortCreateE2E')",
  CohortSettingsCreateNewCohortButton = "#CohortSettingsPanel button:contains('New cohort')",
  CreateNewCohortButton = "button:contains('New cohort')",
  CohortSettingsButton = "#cohortSettings",
  CohortSettingsCancelButton = "#CohortSettingsPanel i[data-icon-name='Cancel']",
  DeleteButtons = "i[data-icon-name='Trash']",
  DuplicateButtons = "button:contains('Duplicate')",
  EditButtons = "button:contains('Edit')",
  ConfirmationDeleteButton = "button:contains('Delete')",
  CohortEditPanel = "#cohortEditPanel",
  CohortNameInput = "#cohortEditPanel input:eq(0)",
  CohortDatasetValueInput = "#cohortEditPanel input[class^='ms-spinButton-input']",
  CohortPredictedYButton = "#cohortEditPanel span:contains('Predicted Y')",
  CohortPredictedYGFirstOption = "#cohortEditPanel div.ms-Checkbox",
  CohortPredictedYGFirstOptionCheckbox = "div.ms-Checkbox",
  CohortPredictedYValuesInput = "#cohortEditPanel div.ms-ComboBox-container input[type='text']",
  CohortPredictedYValuesCaretButton = "#cohortEditPanel i[data-icon-name='ChevronDown']",
  CohortFilterSelection = "#cohortEditPanel [type='radio']",
  CohortAddFilterButton = "button:contains('Add filter')",
  CohortSaveButton = "button:contains('Save')",
  CohortEditorSaveButton = "#cohortEditPanel button:contains('Save')",
  PrimarySaveButton = "#cohortEditPanel button.ms-Button--primary",
  CohortSaveAndSwitchButton = "button:contains('Save and switch')",
  CohortEmptyDialogCloseButton = ".emptyCohortDialog button",
  NewCohortSpan = "span:contains('CohortCreateE2E')",
  WICDatapointDropbox = "#IndividualFeatureContainer div[class^='ms-Stack legendAndText'] div[class^='ms-ComboBox-container']",
  WICLocalImportanceDescription = "#LocalImportanceDescription",
  WhatIfScatterChartYAxis = "#IndividualFeatureContainer div[class^='rotatedVerticalBox']",
  WhatIfScatterChartFlyoutApply = "#AxisConfigPanel button:contains('Apply')",
  WhatIfScatterChartFlyoutCancel = "#AxisConfigPanel button:contains('Cancel')",
  WhatIfScatterChartSelectFeatureCaretButton = "#AxisConfigPanel i[data-icon-name='ChevronDown']",
  WhatIfAxisPanel = "#AxisConfigPanel",
  AxisFeatureDropdown = "#AxisConfigPanel div.ms-ComboBox-container",
  AxisFeatureDropdownOption = "div.ms-ComboBox-optionsContainerWrapper  button[role='option']",
  AxisFeatureDropdownOptionGeneral = "div.ms-ComboBox-optionsContainerWrapper",
  WhatIfAxisFeatureDropdownCurrentOption = "#AxisConfigPanel div.ms-ComboBox-container input[type='text']",
  WhatIfYAxisFeatureDropdownOccupationOption = "div.ms-ComboBox-optionsContainerWrapper button:contains('occupation')",
  WhatIfScatterChartYAxisLabelUpdated = "#IndividualFeatureContainer div[class^='rotatedVerticalBox'] button:contains('occupation')",
  WhatIfYAxisAxisValueNewValue = "#AxisConfigPanel span:contains('True Y')",
  WhatIfScatterChartYAxisLabelUpdated2 = "#IndividualFeatureContainer div[class^='rotatedVerticalBox'] button:contains('True Y')",
  WhatIfCounterfactualPanel = "#CounterfactualPanel",
  CreateWhatIfCounterfactualButton = "#IndividualFeatureContainer button:contains('Create what-if counterfactual')",
  WhatIfCreateCounterfactualSortButton = "#CounterfactualPanel button[class^='ms-Toggle']",
  WhatIfColumnHeaders = "#CounterfactualPanel div[role='columnheader'] span.ms-DetailsHeader-cellName",
  WhatIfSearchBar = "#CounterfactualPanel input[role='searchbox']",
  WhatIfCloseButton = "#CounterfactualPanel button[aria-label='Close']",
  WhatIfSearchBarClearTextButton = "#CounterfactualPanel button[aria-label='Clear text']",
  WhatIfNameLabel = "#whatIfNameLabel",
  CreateYourOwnCounterfactualInputField = "#CounterfactualPanel div[role='gridcell'] input[type='text']",
  CreateYourOwnCounterfactualPredictedValueField = "#CounterfactualPanel div[role='gridcell'] span[class^='predictedValue']",
  WhatIfScatterChartXAxis = "#IndividualFeatureContainer div[class^='ms-Stack horizontalAxisWithPadding']",
  WhatIfXAxisFeatureDropdownOccupationOption = "div.ms-ComboBox-optionsContainerWrapper button:contains('Probability : >50K')",
  WhatIfScatterChartXAxisLabelUpdated = "#IndividualFeatureContainer div[class^='ms-Stack horizontalAxisWithPadding'] button:contains('Probability : >50K')",
  WhatIfScatterChartXAxisLabelUpdatedGeneral = "#IndividualFeatureContainer div[class^='ms-Stack horizontalAxisWithPadding']",
  WhatIfXAxisAxisValueNewValue = "#AxisConfigPanel span:contains('True Y')",
  WhatIfScatterChartXAxisLabelUpdated2 = "#IndividualFeatureContainer div[class^='ms-Stack horizontalAxisWithPadding'] button:contains('True Y')",
  WhatIfSaveAsNewDatapointButton = "#CounterfactualPanel button:contains('Save as new datapoint')",
  WhatIfSaveAsDataPoints = "#IndividualFeatureContainer #iterative-container span",
  WhatIfSaveAsDataPointsDeleteButton = "#IndividualFeatureContainer #iterative-container i[data-icon-name='Clear']",
  WhatIfSetValueButton = "#CounterfactualPanel button:contains('Set Value')",
  DECRotatedVerticalBox = "#DatasetExplorerChart div[class*='rotatedVerticalBox']", // DEC- Data explorer chart
  DECHorizontalAxis = "#DatasetExplorerChart div[class*='horizontalAxis']",
  DECHorizontalAxisButton = "#DatasetExplorerChart div[class*='horizontalAxis'] button",
  DECChoiceFieldGroup = "#AxisConfigPanel div[class*='ms-ChoiceFieldGroup']",
  DECCloseButton = "#AxisConfigPanel button.ms-Panel-closeButton",
  DECAxisPanel = "#AxisConfigPanel div.ms-Panel-main",
  DECohortDropdown = "#dataExplorerCohortDropdown",
  DEDropdownOptions = "div[class^='dropdownItemsWrapper'] button:contains('CohortCreateE2E')",
  DEIndividualDatapoints = "#ChartTypeSelection label:contains('Individual datapoints')",
  DEAggregatePlots = "#ChartTypeSelection label:contains('Aggregate plots')",
  DEYAxisPoints = "#DatasetExplorerChart g[class^='cartesianlayer'] g[class^='ytick'] text",
  DEPoints = "#DatasetExplorerChart .highcharts-scatter-series > path.highcharts-point",
  TooltipContainer = "div[class*='highcharts-tooltip-container']",
  MSCRotatedVerticalBox = "#OverallMetricChart div[class*='rotatedVerticalBox']", // MSC- Model statistics chart
  MSCHorizontalAxis = "#OverallMetricChart div[class*='horizontalAxis']",
  CausalAnalysisHeader = "#ModelAssessmentDashboard #causalAnalysisHeader",
  ErrorAnalysisHeader = "#ModelAssessmentDashboard #errorAnalysisHeader",
  MSSideBarCards = "#OverallMetricChart div[class^='statsBox']",
  AxisConfigPanel = "#AxisConfigPanel",
  MSSideBarNumberOfBinsInput = "#AxisConfigPanel input[class^='ms-spinButton-input']",
  MSScrollable = "#OverallMetricChart div[class^='scrollableWrapper']",
  MSCohortDropdown = "#modelPerformanceCohortPicker",
  MSDropdownOptions = "div[class^='dropdownItemsWrapper'] button:contains('CohortCreateE2E')",
  MSYAxisPoints = "#OverallMetricChart g[class^='cartesianlayer'] g[class^='ytick']",
  CausalCalloutHeader = "#causalAggregateView div[class^='calloutHeader']",
  CausalCalloutInner = "#causalAggregateView div[class^='calloutInner']",
  CausalAnalysisTable = "#causalAggregateView div.ms-DetailsList",
  CausalChartXAxisValues = '#causalAggregateView svg g[class*="highcharts-xaxis-labels"] text',
  CausalAggregateView = "#causalAggregateView",
  ModelOverviewHeader = "#ModelAssessmentDashboard #modelStatisticsHeader",
  ModelOverview = "#ModelOverview",
  ModelOverviewDescription = "#ModelOverview #modelOverviewDescription",
  ModelOverviewMetricSelection = "#ModelOverview #modelOverviewMetricSelection",
  ModelOverviewFeatureSelection = "#ModelOverview #modelOverviewFeatureSelection",
  ModelOverviewFeatureConfigurationActionButton = "#ModelOverview #modelOverviewFeatureConfigurationActionButton",
  ModelOverviewHeatmapVisualDisplayToggle = "#ModelOverview #modelOverviewHeatmapVisualDisplayToggle",
  ModelOverviewCohortViewSelector = "#ModelOverview #modelOverviewCohortViewSelector",
  ModelOverviewCohortViewSelectorButtons = "#ModelOverview #modelOverviewCohortViewSelector button",
  ModelOverviewCohortViewFeatureCohortViewButton = "#ModelOverview #modelOverviewCohortViewSelector button[name='Feature cohorts']",
  ModelOverviewCohortViewDatasetCohortViewButton = "#ModelOverview #modelOverviewCohortViewSelector button[name='Dataset cohorts']",
  ModelOverviewDatasetCohortStatsTable = "#ModelOverview #modelOverviewDatasetCohortStatsTable",
  ModelOverviewDisaggregatedAnalysisTable = "#ModelOverview #modelOverviewDisaggregatedAnalysisTable",
  ModelOverviewTableYAxisGrid = "#ModelOverview .highcharts-grid-axis > span",
  ModelOverviewHeatmapCells = "#ModelOverview .highcharts-heatmap-series > .highcharts-data-label > text > tspan",
  ModelOverviewDisaggregatedAnalysisBaseCohortDisclaimer = "#ModelOverview #modelOverviewDisaggregatedAnalysisBaseCohortDisclaimer",
  ModelOverviewDisaggregatedAnalysisBaseCohortWarning = "#ModelOverview #modelOverviewDisaggregatedAnalysisBaseCohortWarning",
  ModelOverviewChartPivot = "#ModelOverview #modelOverviewChartPivot",
  ModelOverviewChartPivotItems = "#ModelOverview #modelOverviewChartPivot .ms-Pivot-link",
  ModelOverviewProbabilityDistributionChart = "#ModelOverview #modelOverviewProbabilityDistributionChart",
  ModelOverviewProbabilityDistributionChartToggle = "#ModelOverview #modelOverviewProbabilityDistributionChartToggle",
  ModelOverviewProbabilityDistributionLineChartCohortSelectionButton = "#ModelOverview #modelOverviewProbabilityDistributionLineChartCohortSelectionButton",
  ModelOverviewProbabilityDistributionBoxChartCohortSelectionButton = "#ModelOverview #modelOverviewProbabilityDistributionBoxChartCohortSelectionButton",
  ModelOverviewProbabilityDistributionChartLabelSelectionFlyout = "#ModelOverview #modelOverviewProbabilityDistributionChartLabelSelectionFlyout",
  ModelOverviewProbabilityDistributionChartBoxes = "#ModelOverview #modelOverviewProbabilityDistributionChart .highcharts-boxplot-series  > .highcharts-point",
  ModelOverviewRegressionDistributionChart = "#ModelOverview #modelOverviewRegressionDistributionChart",
  ModelOverviewRegressionDistributionChartBoxes = "#ModelOverview #modelOverviewRegressionDistributionChart .highcharts-boxplot-series > .highcharts-point",
  ModelOverviewMetricChartCohortSelectionButton = "#ModelOverview #modelOverviewMetricChartCohortSelectionButton",
  ModelOverviewMetricChart = "#ModelOverview #ModelOverviewMetricChart",
  ModelOverviewMetricChartBars = "#ModelOverview #ModelOverviewMetricChart .highcharts-bar-series > rect",
  ModelOverviewConfusionMatrix = "#ModelOverview #modelOverviewConfusionMatrix",
  ModelOverviewConfusionMatrixHeatmap = "#ModelOverview #ModelOverviewConfusionMatrix",
  MissingParameterPlaceholder = "#ModelOverview #MissingParameterPlaceholder",
  CounterfactualHeader = "#ModelAssessmentDashboard span:contains('What-If counterfactuals')",
  DataAnalysisPivot = "#dataAnalysisPivot",
  DataAnalysisTab = "#dataAnalysisPivot .ms-Pivot-link",
  DataBalancePivotItem = "#dataAnalysisPivot button[name='Data balance']",
  FeatureBalanceMeasures = "#featureBalanceMeasures",
  FeatureBalanceMeasuresHeader = "#featureBalanceMeasures #featureBalanceMeasuresHeader",
  FeatureBalanceMeasuresLabelDropdown = "#featureBalanceMeasures #labelDropdown",
  FeatureBalanceMeasuresFeatureDropdown = "#featureBalanceMeasures #featureDropdown",
  FeatureBalanceMeasuresMeasureDropdown = "#featureBalanceMeasures #measureDropdown",
  FeatureBalanceMeasuresHeatmap = "#featureBalanceMeasures .highcharts-root",
  FeatureBalanceMeasuresXAxis = "#featureBalanceMeasures .highcharts-xaxis-grid",
  FeatureBalanceMeasuresYAxis = "#featureBalanceMeasures .highcharts-yaxis-grid",
  FeatureBalanceMeasuresColorAxis = "#featureBalanceMeasures .highcharts-coloraxis-grid",
  FeatureBalanceMeasuresXAxisTitle = "#featureBalanceMeasures .highcharts-root > .highcharts-xaxis > .highcharts-axis-title",
  FeatureBalanceMeasuresYAxisTitle = "#featureBalanceMeasures .highcharts-root > .highcharts-yaxis > .highcharts-axis-title",
  DistributionBalanceMeasures = "#distributionBalanceMeasures",
  DistributionBalanceMeasuresHeader = "#distributionBalanceMeasures #distributionBalanceMeasuresHeader",
  DistributionBalanceMeasuresLegendItems = "#distributionBalanceMeasures .highcharts-legend-item",
  DistributionBalanceMeasuresLegendHiddenItems = "#distributionBalanceMeasures .highcharts-legend-item-hidden",
  DistributionBalanceMeasuresXAxes = "#distributionBalanceMeasures .highcharts-xaxis-grid",
  DistributionBalanceMeasuresYAxes = "#distributionBalanceMeasures .highcharts-yaxis-grid",
  DistributionBalanceMeasuresAxisTitles = "#distributionBalanceMeasures .highcharts-axis-title div",
  AggregateBalanceMeasures = "#aggregateBalanceMeasures",
  AggregateBalanceMeasuresHeader = "#aggregateBalanceMeasures #aggregateBalanceMeasuresHeader",
  AggregateBalanceMeasuresTable = "#aggregateBalanceMeasures .ms-DetailsList",
  AggregateBalanceMeasuresTableColumns = "#aggregateBalanceMeasures .ms-DetailsList-headerWrapper div[aria-label]",
  AggregateBalanceMeasuresTableRows = "#aggregateBalanceMeasures .ms-DetailsRow",
  VisionDataExplorer = "#VisionDataExplorer",
  VisionDataExplorerCohortDropDown = "#VisionDataExplorer #dataExplorerCohortDropdown",
  VisionDataExplorerSearchBox = "##VisionDataExplorer dataExplorerSearchBox",
  VisionDataExplorerThumbnailSize = "#VisionDataExplorer #dataExplorerThumbnailSize",
  VisionDataExplorerCohortPickerLabel = "#VisionDataExplorer #dataExplorerCohortPickerLabel",
  VisionDataExplorerImageExplorerViewButton = "#VisionDataExplorer button[name='Image explorer view']",
  VisionDataExplorerTableViewButton = "#VisionDataExplorer button[name='Table view']",
  VisionDataExplorerClassViewButton = "#VisionDataExplorer button[name='Class view']",
  VisionDataExplorerPredictedLabel = "#VisionDataExplorer #predictedLabel",
  VisionDataExplorerLegendFailure = "#VisionDataExplorer #legendFailure",
  VisionDataExplorerLegendSuccess = "#VisionDataExplorer #legendSuccess",
  VisionDataExplorerImageExplorerViewErrorInstances = "#VisionDataExplorer #errorInstances",
  VisionDataExplorerImageExplorerViewSuccessInstances = "#VisionDataExplorer #successInstances",
  VisionDataExplorerImageExplorerViewErrorImageContainer = "#VisionDataExplorer #errorImageContainer",
  VisionDataExplorerImageExplorerViewSuccessImageContainer = "#VisionDataExplorer #successImageContainer",
  VisionDataExplorerTabsViewTableList = "#VisionDataExplorer #tabsViewTableList",
  VisionDataExplorerTabsViewItemsSelectedStatement = "#VisionDataExplorer #itemsSelectedStatement",
  VisionDataExplorerTabsViewSaveCohortButton = "#VisionDataExplorer #saveCohortButton",
  VisionDataExplorerPageSizeSelector = "#VisionDataExplorer #pageSizeSelector",
  VisionDataExplorerClassViewLabelTypeDropdown = "#VisionDataExplorer #labelTypeDropdown",
  VisionDataExplorerClassViewLabelDisplayDropdown = "#VisionDataExplorer #labelVisibilitySelectorsDropdown",
  VisionDataExplorerClassViewDataCharacteristicsLegend = "#VisionDataExplorer #dataCharacteristicsLegend",
  VisionDataExplorerClassViewContainer = "#VisionDataExplorer #classViewContainer"
}

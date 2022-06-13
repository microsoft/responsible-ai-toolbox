// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export enum Locators {
  SelectButton = "button:contains('Select')",
  CancelButton = "button:contains('Cancel')",
  YesButton = "button:contains('Yes')",
  SaveAsNewCohortButton = "button:contains('Save as a new cohort')",
  ClearSelectionButton = "button:contains('Clear selection')",
  IFIPredictionSpan = "span[class^='headerCount']", // IFI - Individual feature importance
  IFICollapseButton = "i[data-icon-name='ChevronRightMed']",
  IFITableRowSelected = 'div[class^="ms-List-page"] div[class^="ms-DetailsRow"] div[class^="ms-Check is-checked"]',
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
  IFIDataPointDropdown = "div[class^='featureImportanceLegend'] div[role='listbox']",
  ICEFeatureDropdown = "div[class^='featureImportanceLegend'] div[class^='ms-ComboBox-container'] button[class^='ms-Button ms-Button--icon ms-ComboBox-CaretDown-button']",
  ICEFeatureDropdownOption = "div[class^='featureImportanceLegend'] div[class^='ms-ComboBox-container'] button:contains('workclass')",
  ICEXAxisNewValue = "#subPlotContainer text[class^='highcharts-axis-title']",
  ICEToolTipButton = "#subPlotContainer button:contains('How to read this chart')",
  ICECalloutTitle = "#subPlotContainer div.ms-Callout-container span[class^='calloutTitle']",
  ICECalloutBody = "#subPlotContainer div.ms-Callout-container div[class^='calloutInner']",
  SortByDropdown = "#featureImportanceChartContainer div.ms-Dropdown-container",
  SortByDropdownOptions = "div[class^='dropdownItemsWrapper'] button:contains('CohortCreateE2E')",
  CreateNewCohortButton = "button:contains('New cohort')",
  CohortEditPanel = "#cohortEditPanel",
  CohortNameInput = "#cohortEditPanel input:eq(0)",
  CohortDatasetValueInput = "#cohortEditPanel input[class^='ms-spinButton-input']",
  CohortFilterSelection = "#cohortEditPanel [type='radio']",
  CohortAddFilterButton = "button:contains('Add filter')",
  CohortSaveButton = "button:contains('Save')",
  CohortSaveAndSwitchButton = "button:contains('Save and switch')",
  CohortEmptyDialogCloseButton = ".emptyCohortDialog button",
  NewCohortSpan = "span:contains('CohortCreateE2E')",
  WICDatapointDropbox = "#IndividualFeatureContainer div[class^='ms-Stack legendAndText'] div[class^='ms-ComboBox-container']",
  WICLocalImportanceDescription = "#LocalImportanceDescription",
  WhatIfScatterChartYAxis = "#IndividualFeatureContainer div[class^='rotatedVerticalBox']",
  WhatIfScatterChartFlyoutCancel = "#AxisConfigPanel button:contains('Cancel')",
  WhatIfScatterChartFlyoutSelect = "#AxisConfigPanel button:contains('Select')",
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
  DEPointTooltip = ".highcharts-tooltip",
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
  CounterfactualHeader = "#ModelAssessmentDashboard span:contains('What-If counterfactuals')"
}

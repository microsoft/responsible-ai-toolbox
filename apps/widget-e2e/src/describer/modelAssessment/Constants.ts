// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export enum Locators {
  IFIPredictionSpan = "span[class^='headerCount']", // IFI - Individual feature importance
  IFIExpandCollapseButton = "[aria-label='expand collapse group']",
  IFITableRowSelected = 'div[class^="ms-List-page"] div[class^="ms-DetailsRow"] div[class^="ms-Check is-checked"]',
  IFIDropdownSelectedOption = "div[class^='featureImportanceChartAndLegend']",
  IFIScrollableTable = "div.tabularDataView div.ms-ScrollablePane div.ms-ScrollablePane--contentContainer",
  IFINumberOfBars = "#FeatureImportanceBar svg .plot .points .point path",
  IFIYAxisValue = '#FeatureImportanceBar div[class^="rotatedVerticalBox-"]',
  IFIXAxisValue = '#FeatureImportanceBar g[class^="cartesianlayer"] g[class^="xtick"]',
  ICEPlot = '#subPlotChoice label:contains("ICE")', // ICE - Individual Conditional Expectation
  ICENoOfPoints = "#subPlotContainer svg g[class^='plot'] .points .point",
  IFITopFeaturesText = "div[class^='featureImportanceControls'] span[class^='sliderLabel']",
  IFITopFeaturesValue = "div[class^='featureImportanceControls'] div.ms-Slider-container div.ms-Slider-slideBox",
  IFIAbsoluteValuesToggleButton = "div[class^='featureImportanceLegend'] div.ms-Toggle",
  IFIDataPointDropdown = "div[class^='featureImportanceLegend'] div[role='listbox']",
  ICEFeatureDropdown = "div[class^='featureImportanceLegend'] div[class^='ms-ComboBox-container'] button[class^='ms-Button ms-Button--icon ms-ComboBox-CaretDown-button']",
  ICEFeatureDropdownOption = "div[class^='featureImportanceLegend'] div[class^='ms-ComboBox-container'] button:contains('workclass')",
  ICEXAxisNewValue = "#subPlotContainer text[class^='xtitle']",
  ICEToolTipButton = "#subPlotContainer button:contains('How to read this chart')",
  ICECalloutTitle = "#subPlotContainer div.ms-Callout-container span[class^='calloutTitle']",
  ICECalloutBody = "#subPlotContainer div.ms-Callout-container div[class^='calloutInner']",
  SortByDropdown = "div[class^='globalChartWithLegend'] div.ms-Dropdown-container",
  SortByDropdownOptions = "div[class^='dropdownItemsWrapper'] button:contains('CohortCreateE2E')",
  CohortOnOffSelectionContainer = "#iterative-container",
  CohortOnOffCohortCreateE2E = "#iterative-container div:contains(CohortCreateE2E) [role='checkbox']",
  CreateNewCohortButton = "button:contains('Create new cohort')",
  CohortNameInput = "#cohortEditPanel input:eq(0)",
  CohortDatasetValueInput = "#cohortEditPanel input[class^='ms-spinButton-input']",
  CohortFilterSelection = "#cohortEditPanel [type='radio']",
  CohortAddFilterButton = "button:contains('Add filter')",
  CohortSaveAndSwitchButton = "button:contains('Save and switch')",
  NewCohortSpan = "span:contains('CohortCreateE2E')",
  WICDatapointDropbox = "#IndividualFeatureContainer div[class^='legendAndText'] div[class^='ms-ComboBox-container']",
  WICLocalImportanceDescription = "#LocalImportanceDescription",
  WhatIfScatterChartYAxis = "#IndividualFeatureContainer div[class^='rotatedVerticalBox']",
  WhatIfScatterChartFlyoutCancel = "#AxisConfigPanel button:contains('Cancel')",
  WhatIfScatterChartFlyoutSelect = "#AxisConfigPanel button:contains('Select')",
  WhatIfAxisPanel = "#AxisConfigPanel",
  AxisFeatureDropdown = "#AxisConfigPanel div.ms-ComboBox-container",
  AxisFeatureDropdownOption = "div.ms-ComboBox-optionsContainerWrapper  button[role='option']",
  WhatIfAxisFeatureDropdownCurrentOption = "#AxisConfigPanel div.ms-ComboBox-container input[type='text']",
  WhatIfYAxisFeatureDropdownOccupationOption = "div.ms-ComboBox-optionsContainerWrapper button:contains('occupation')",
  WhatIfScatterChartYAxisLabelUpdated = "#IndividualFeatureContainer div[class^='rotatedVerticalBox'] button:contains('occupation')",
  WhatIfYAxisAxisValueNewValue = "#AxisConfigPanel span:contains('True Y')",
  WhatIfScatterChartYAxisLabelUpdated2 = "#IndividualFeatureContainer div[class^='rotatedVerticalBox'] button:contains('True Y')",
  WhatIfCounterfactualPanel = "#CounterfactualPanel",
  CreateWhatIfCounterfactualButton = "#IndividualFeatureContainer button:contains('Create what-if counterfactual')",
  WhatIfCreateCounterfactualSortButton = "#CounterfactualPanel button[class^='ms-Toggle']",
  WhatIfColumnHeaders = "#CounterfactualPanel div[role='columnheader']",
  WhatIfSearchBar = "#CounterfactualPanel div[role='search']",
  WhatIfCloseButton = "#CounterfactualPanel button[aria-label='Close']",
  WhatIfSearchBarClearTextButton = "#CounterfactualPanel button[aria-label='Clear text']",
  WhatIfNameLabel = "#whatIfNameLabel",
  CreateYourOwnCounterfactualInputField = "#CounterfactualPanel div[role='gridcell'] input[type='text']",
  WhatIfScatterChartXAxis = "#IndividualFeatureContainer div[class^='horizontalAxisWithPadding']",
  WhatIfXAxisFeatureDropdownOccupationOption = "div.ms-ComboBox-optionsContainerWrapper button:contains('Probability : >50K')",
  WhatIfScatterChartXAxisLabelUpdated = "#IndividualFeatureContainer div[class^='horizontalAxisWithPadding'] button:contains('Probability : >50K')",
  WhatIfXAxisAxisValueNewValue = "#AxisConfigPanel span:contains('True Y')",
  WhatIfScatterChartXAxisLabelUpdated2 = "#IndividualFeatureContainer div[class^='horizontalAxisWithPadding'] button:contains('True Y')",
  WhatIfSaveAsNewDatapointButton = "#CounterfactualPanel button:contains('Save as new datapoint')",
  WhatIfSaveAsDataPoints = "#IndividualFeatureContainer #iterative-container span",
  WhatIfSaveAsDataPointsDeleteButton = "#IndividualFeatureContainer #iterative-container i[data-icon-name='Clear']",
  WhatIfSetValueButton = "#CounterfactualPanel button:contains('Set Value')",
  DECRotatedVerticalBox = "#DatasetExplorerChart div[class*='rotatedVerticalBox']", // DEC- Data explorer chart
  DECHorizontalAxis = "#DatasetExplorerChart div[class*='horizontalAxis']",
  DECChoiceFieldGroup = "#AxisConfigPanel div[class*='ms-ChoiceFieldGroup']",
  DECCloseButton = "#AxisConfigPanel button.ms-Panel-closeButton",
  DECAxisPanel = "#AxisConfigPanel div.ms-Panel-main",
  CancelButton = "button:contains('Cancel')",
  MSCRotatedVerticalBox = "#ModelPerformanceChart div[class*='rotatedVerticalBox']", // MSC- Model statistics chart
  MSCHorizontalAxis = "#ModelPerformanceChart div[class*='horizontalAxis']",
  DECohortDropdown = "#dataExplorerCohortDropdown",
  DEDropdownOptions = "div[class^='dropdownItemsWrapper'] button:contains('CohortCreateE2E')",
  SelectButton = "button:contains('Select')",
  DEIndividualDatapoints = "#ChartTypeSelection label:contains('Individual datapoints')",
  DEAggregatePlots = "#ChartTypeSelection label:contains('Aggregate plots')",
  DEYAxisPoints = "#DatasetExplorerChart g[class^='cartesianlayer'] g[class^='ytick']"
}

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
  IFIDatapointDropdown = "div[class^='featureImportanceLegend'] div.ms-Dropdown-container",
  IFIAbsoluteValuesToggleButton = "div[class^='featureImportanceLegend'] div.ms-Toggle",
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
  CohortFilterSelection = "#cohortEditPanel [type='radio']",
  CohortAddFilterButton = "button:contains('Add filter')",
  CohortSaveAndSwitchButton = "button:contains('Save and switch')",
  NewCohortSpan = "span:contains('CohortCreateE2E')"
}

// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export enum Locators {
  IFIPredictionSpan = "span[class^='headerCount']", // IFI - Individual feature importance
  IFIExpandCollapseButton = "[aria-label='expand collapse group']",
  IFITableRowSelected = 'div[class^="ms-List-page"] div[class^="ms-DetailsRow"] div[class^="ms-Check is-checked"]',
  IFIDropdownSelectedOption = "div[class^='featureImportanceChartAndLegend']",
  IFINumberOfBars = "#FeatureImportanceBar svg .plot .points .point path",
  IFIYAxisValue = '#FeatureImportanceBar div[class^="rotatedVerticalBox-"]',
  IFIXAxisValue = '#FeatureImportanceBar g[class^="cartesianlayer"] g[class^="xtick"]',
  ICEPlot = '#subPlotChoice label:contains("ICE")', // ICE - Individual Conditional Expectation
  ICENoOfPoints = "#subPlotContainer svg g[class^='plot'] .points .point"
}

// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IDataset } from "@responsible-ai/core-ui";

import { mockForecastingData } from "./mockForecastingData";

// Based on how much money is spent on ads and the daily outside temperature
// predict the number of people dining at a restaurant on any given day.
export const mockForecastingDataSingleTimeSeries: IDataset = JSON.parse(
  JSON.stringify(mockForecastingData)
);

const startingIndexBobsSandwichesTimeSeries = 20;
const endingIndexBobsSandwichesTimeSeries = 30;

mockForecastingDataSingleTimeSeries.features =
  mockForecastingData.features.slice(
    startingIndexBobsSandwichesTimeSeries,
    endingIndexBobsSandwichesTimeSeries
  );
mockForecastingDataSingleTimeSeries.index = mockForecastingData.index?.slice(
  startingIndexBobsSandwichesTimeSeries,
  endingIndexBobsSandwichesTimeSeries
);
mockForecastingDataSingleTimeSeries.predicted_y =
  mockForecastingData.predicted_y?.slice(
    startingIndexBobsSandwichesTimeSeries,
    endingIndexBobsSandwichesTimeSeries
  );
if (mockForecastingData.true_y) {
  mockForecastingDataSingleTimeSeries.true_y = mockForecastingData.true_y.slice(
    startingIndexBobsSandwichesTimeSeries,
    endingIndexBobsSandwichesTimeSeries
  );
}

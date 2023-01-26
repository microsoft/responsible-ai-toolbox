// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IDataset } from "@responsible-ai/core-ui";

import { mockForecastingData } from "./mockForecastingData";

// Based on how much money is spent on ads and the daily outside temperature
// predict the number of people dining at a restaurant on any given day.
export const mockForecastingDataNoFeatures: IDataset = JSON.parse(
  JSON.stringify(mockForecastingData)
);

const timeSeriesIDColumnNames = ["restaurant", "city"];
mockForecastingDataNoFeatures.feature_names = timeSeriesIDColumnNames;
mockForecastingDataNoFeatures.feature_metadata = {
  categorical_features: timeSeriesIDColumnNames,
  time_series_id_column_names: timeSeriesIDColumnNames
};

mockForecastingDataNoFeatures.features = mockForecastingData.features.map(
  (row) => row.slice(-2)
);

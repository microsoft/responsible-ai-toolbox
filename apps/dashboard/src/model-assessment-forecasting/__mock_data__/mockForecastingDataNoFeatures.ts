// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IDataset } from "@responsible-ai/core-ui";

import { mockForecastingData } from "./mockForecastingData";

// Based on how much money is spent on ads and the daily outside temperature
// predict the number of people dining at a restaurant on any given day.
export const mockForecastingDataNoFeatures: IDataset = JSON.parse(
  JSON.stringify(mockForecastingData)
);

const timeSeriesIDFeatures = ["restaurant", "city"];
mockForecastingDataNoFeatures.feature_names = timeSeriesIDFeatures;
mockForecastingDataNoFeatures.feature_metadata = {
  categorical_features: timeSeriesIDFeatures,
  time_series_id_features: timeSeriesIDFeatures
};

mockForecastingDataNoFeatures.features = mockForecastingData.features.map(
  (row) => row.slice(-2)
);

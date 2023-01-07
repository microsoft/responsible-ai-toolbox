// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { DatasetTaskType, IDataset } from "@responsible-ai/core-ui";

// Based on how much money is spent on ads and the daily outside temperature
// predict the number of people dining at a restaurant on any given day.
export const mockForecastingData: IDataset = {
  categorical_features: [],
  feature_metadata: {},
  feature_names: [],

  features: [],
  predicted_y: [],
  task_type: DatasetTaskType.Regression,
  true_y: []
};

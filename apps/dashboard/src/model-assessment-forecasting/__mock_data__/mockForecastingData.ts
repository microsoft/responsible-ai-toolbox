// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { DatasetTaskType, IDataset } from "@responsible-ai/core-ui";

// create larger dataset
export const mockForecastingData: IDataset = {
  categorical_features: [],
  feature_names: ["price", "weather"],
  features: [
    [1, 12],
    [2, 12]
  ],
  index: ["2010-10-10", "2010-10-11"],
  is_forecasting_true_y: true,
  predicted_y: [13, 4],
  task_type: DatasetTaskType.Forecasting,
  true_y: [13, 4]
};

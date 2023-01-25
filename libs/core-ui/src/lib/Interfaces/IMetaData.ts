// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export interface IFeatureMetaData {
  identity_feature_name?: string;
  time_column_name?: string;
  categorical_features?: string[];
  dropped_features?: string[];
  time_series_id_column_names?: string[];
}

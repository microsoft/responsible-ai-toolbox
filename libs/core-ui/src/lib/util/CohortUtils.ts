// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { JointDataset } from "./JointDataset";

enum ColumnNames {
  Index = "Index",
  PredictedY = "Predicted Y",
  TrueY = "True Y",
  ClassificationError = "Classification outcome",
  RegressionError = "Regression error"
}

export function getColumnName(filterColumn: string): string {
  switch (filterColumn) {
    case JointDataset.IndexLabel:
      return ColumnNames.Index;
    case JointDataset.PredictedYLabel:
      return ColumnNames.PredictedY;
    case JointDataset.TrueYLabel:
      return ColumnNames.TrueY;
    case JointDataset.ClassificationError:
      return ColumnNames.ClassificationError;
    case JointDataset.RegressionError:
      return ColumnNames.RegressionError;
    default:
      return "";
  }
}

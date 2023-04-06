// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  DatasetCohortColumns,
  IJointMeta,
  JointDataset
} from "@responsible-ai/core-ui";
import { IColumnRange, RangeTypes } from "@responsible-ai/mlchartlib";
import _ from "lodash";

// a workaround for explanation dashboard to use the new filter in CohortEditor
export function buildColumnRanges(jointDataset: JointDataset): {
  [key: string]: IColumnRange;
} {
  const range: {
    [key: string]: IColumnRange;
  } = {};
  for (const [key, value] of Object.entries(jointDataset.metaDict)) {
    const columnRange = getRange(key, value, jointDataset.dataDict);
    if (columnRange) {
      if (key === JointDataset.RegressionError) {
        range[DatasetCohortColumns.RegressionError] = columnRange;
      }
      if (key === JointDataset.ClassificationError) {
        range[DatasetCohortColumns.ClassificationError] = columnRange;
      }
      if (key === JointDataset.IndexLabel) {
        range[DatasetCohortColumns.Index] = columnRange;
      }
      if (key === JointDataset.TrueYLabel) {
        range[DatasetCohortColumns.TrueY] = columnRange;
      }
      if (key === JointDataset.PredictedYLabel) {
        range[DatasetCohortColumns.PredictedY] = columnRange;
      }
      if (key.startsWith(JointDataset.DataLabelRoot)) {
        range[value.label] = columnRange;
      }
    }
  }
  return range;
}

function getRange(
  key: string,
  value: IJointMeta,
  dataDict: Array<{ [key: string]: number }> | undefined
): IColumnRange | undefined {
  if (value.isCategorical) {
    return {
      rangeType: RangeTypes.Categorical,
      sortedUniqueValues: value.sortedCategoricalValues || []
    };
  }
  const vector = dataDict?.map((row) => row[key]);
  return {
    max: value.featureRange?.max,
    min: value.featureRange?.min,
    rangeType: value.featureRange?.rangeType || RangeTypes.Numeric,
    sortedUniqueValues: _.uniq(vector).sort((a, b) => {
      return a - b;
    })
  };
}

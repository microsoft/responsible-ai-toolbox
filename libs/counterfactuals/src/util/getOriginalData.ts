// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  ICounterfactualData,
  IDataset,
  JointDataset
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";

export function getOriginalData(
  index: number,
  jointDataset: JointDataset,
  dataset: IDataset,
  counterfactualData?: ICounterfactualData
): { [key: string]: string | number } | undefined {
  const data = {
    row: localization.formatString(
      localization.Counterfactuals.referenceDatapoint,
      index
    )
  };
  if (counterfactualData) {
    const featureNames = counterfactualData.feature_names_including_target;
    const dataPoint = counterfactualData.test_data[0][0];
    featureNames.forEach((f, index) => {
      data[f] = dataPoint[index];
    });

    return data;
  }

  const row = jointDataset.getRow(index);
  const dataPoint = JointDataset.datasetSlice(
    row,
    jointDataset.metaDict,
    jointDataset.datasetFeatureCount
  );

  const featureNames = dataset.feature_names;
  featureNames.forEach((f, index) => {
    data[f] = dataPoint[index];
  });
  const targetColumn = Array.isArray(dataset.target_column)
    ? dataset.target_column?.[0]
    : dataset.target_column;
  const targetLabel = targetColumn || "y";
  data[targetLabel] = row[JointDataset.TrueYLabel];
  return data;
}

// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IDataset, JointDataset } from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";

export function getOriginalData(
  index: number,
  jointDataset: JointDataset,
  dataset: IDataset
): { [key: string]: string | number } | undefined {
  const row = jointDataset.getRow(index);
  const dataPoint = JointDataset.datasetSlice(
    row,
    jointDataset.metaDict,
    jointDataset.datasetFeatureCount
  );
  const data = {
    row: localization.formatString(
      localization.Counterfactuals.referenceDatapoint,
      index
    )
  };
  const featureNames = dataset.feature_names;
  featureNames.forEach((f, index) => {
    data[f] = dataPoint[index];
  });
  const targetLabel = dataset.target_column || "y";
  data[targetLabel] = row[JointDataset.TrueYLabel];
  return data;
}

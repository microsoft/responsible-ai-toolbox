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
  ifEnableLargeData: boolean,
  counterfactualData?: ICounterfactualData
): { [key: string]: string | number } | undefined {
  const data = {
    row: localization.formatString(
      localization.Counterfactuals.referenceDatapoint,
      index
    )
  };
  if (ifEnableLargeData && counterfactualData) {
    const featureNames = counterfactualData.feature_names_including_target;
    const dataPoint = counterfactualData.test_data[0][0];
    featureNames.forEach((f, index) => {
      data[f] = dataPoint[index];
    });

    console.log("!!data in if: ", data);
    return data;
  }

  const row = jointDataset.getRow(index);
  console.log("!!row: ", row);
  const dataPoint = JointDataset.datasetSlice(
    row,
    jointDataset.metaDict,
    jointDataset.datasetFeatureCount
  );
  console.log("!!dataPoint: ", dataPoint);

  console.log("!!data: ", data);
  const featureNames = dataset.feature_names;
  featureNames.forEach((f, index) => {
    data[f] = dataPoint[index];
  });
  console.log("!!featureNames: ", featureNames);
  const targetColumn = Array.isArray(dataset.target_column)
    ? dataset.target_column?.[0]
    : dataset.target_column;
  const targetLabel = targetColumn || "y";
  console.log("!!targetLabel: ", targetLabel);
  data[targetLabel] = row[JointDataset.TrueYLabel];
  console.log("!!data: ", data);

  console.log("!!data: ", data);
  return data;
}

// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IDropdownOption } from "office-ui-fabric-react";

import { JointDataset } from "./JointDataset";

export function getFeatureOptions(
  jointDataset: JointDataset
): IDropdownOption[] {
  const featuresOption = new Array(jointDataset.datasetFeatureCount)
    .fill(0)
    .map((_, index) => {
      const key = JointDataset.DataLabelRoot + index.toString();
      const meta = jointDataset.metaDict[key];
      const options = meta.isCategorical
        ? meta.sortedCategoricalValues?.map(
            (optionText: string, index: number) => {
              return { key: index, text: optionText };
            }
          )
        : undefined;
      return {
        data: {
          categoricalOptions: options,
          fullLabel: meta.label.toLowerCase()
        },
        key,
        text: meta.abbridgedLabel
      };
    });
  return featuresOption;
}

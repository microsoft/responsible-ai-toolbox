// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IDropdownOption } from "@fluentui/react";

import { JointDataset } from "./JointDataset";

export function getFeatureOptions(
  jointDataset: JointDataset
): IDropdownOption[] {
  const featuresOption = new Array(jointDataset.datasetFeatureCount)
    .fill(0)
    .map((_, index) => {
      const key: string = JointDataset.DataLabelRoot + index.toString();
      const meta = jointDataset.metaDict[key];
      const options = meta.isCategorical
        ? meta.sortedCategoricalValues
            ?.filter(
              (optionText: string | number) =>
                !!optionText &&
                typeof optionText !== "boolean" &&
                typeof optionText !== "number"
            )
            .map((optionText: string | number, index: number) => {
              if (typeof optionText !== "string") {
                optionText = optionText.toString();
              }
              return { key: index, text: optionText };
            })
        : undefined;
      return {
        data: {
          categoricalOptions: options,
          fullLabel: meta.label.toLocaleLowerCase()
        },
        key,
        text: meta.abbridgedLabel
      };
    });
  return featuresOption;
}

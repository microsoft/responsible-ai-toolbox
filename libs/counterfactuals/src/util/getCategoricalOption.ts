// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IDropdownOption } from "@fluentui/react";
import { JointDataset } from "@responsible-ai/core-ui";

export function getCategoricalOption(
  jointDataset: JointDataset,
  featureName?: string
): IDropdownOption | undefined {
  if (!featureName) {
    return undefined;
  }
  for (const [key, meta] of Object.entries(jointDataset?.metaDict)) {
    if (meta?.label === featureName && meta?.isCategorical) {
      const options = meta?.sortedCategoricalValues?.map(
        (optionText: string) => {
          return { key: `${optionText}`, text: `${optionText}` };
        }
      );
      return {
        data: {
          categoricalOptions: options,
          fullLabel: meta?.label
        },
        key,
        text: meta?.abbridgedLabel
      };
    }
  }
  return undefined;
}

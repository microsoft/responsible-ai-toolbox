// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ICounterfactualData } from "@responsible-ai/core-ui";

export function getTargetFeatureName(
  data?: ICounterfactualData
): string | undefined {
  return data?.feature_names_including_target[
    data?.feature_names_including_target.length - 1
  ];
}

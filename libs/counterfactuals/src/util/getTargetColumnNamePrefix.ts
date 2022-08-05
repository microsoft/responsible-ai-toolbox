// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { localization } from "@responsible-ai/localization";

export function getTargetColumnNamePrefix(
  desiredRange?: [number, number]
): string {
  if (desiredRange !== undefined) {
    return localization.Counterfactuals.WhatIf.predictedValue;
  }
  return localization.Counterfactuals.WhatIf.predictedClass;
}

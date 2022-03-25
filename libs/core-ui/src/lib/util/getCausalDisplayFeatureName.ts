// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ICausalAnalysisSingleData } from "../Interfaces/ICausalAnalysisData";

export function getCausalDisplayFeatureName(
  item: ICausalAnalysisSingleData
): string {
  return item.feature_value
    ? `${item.feature}(${item.feature_value})`
    : item.feature;
}

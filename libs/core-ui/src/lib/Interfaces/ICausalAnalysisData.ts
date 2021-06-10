// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ICausalAnalysisSingleData } from "./ICausalAnalysisSingleData";

export interface ICausalAnalysisData {
  globalCausalEffects: ICausalAnalysisSingleData[];
  localCausalEffects: ICausalAnalysisSingleData[][];
}

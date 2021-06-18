// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ICausalAnalysisSingleData } from "./ICausalAnalysisSingleData";

export interface ICausalAnalysisData {
  global_effects: ICausalAnalysisSingleData[];
  local_effects: ICausalAnalysisSingleData[][];
}

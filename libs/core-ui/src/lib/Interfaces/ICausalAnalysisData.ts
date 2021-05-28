// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ICausalAnalysisSingleData } from "./ICausalAnalysisSingleData";

export interface ICausalAnalysisData {
  global: ICausalAnalysisSingleData[];
  local: ICausalAnalysisSingleData[][];
}

// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ICasualAnalysisSingleData } from "./ICasualAnalysisSingleData";

export interface ICasualAnalysisData {
    global: ICasualAnalysisSingleData,
    local:ICasualAnalysisSingleData[],
  }
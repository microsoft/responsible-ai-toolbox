// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IExplanationDashboardData } from "@responsible-ai/core-ui";

import { irisData } from "./irisData";

export const irisDataNoLocal: IExplanationDashboardData = {
  ...irisData,
  precomputedExplanations: {
    ...irisData.precomputedExplanations,
    localFeatureImportance: undefined
  }
};

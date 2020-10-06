// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IExplanationDashboardData } from "@responsible-ai/interpret";

import { bostonData } from "./bostonData";

export const bostonDataGlobal: IExplanationDashboardData = {
  ...bostonData,
  precomputedExplanations: {
    ...bostonData.precomputedExplanations,
    localFeatureImportance: undefined
  }
};

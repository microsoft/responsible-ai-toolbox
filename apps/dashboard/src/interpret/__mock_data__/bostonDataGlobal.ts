// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IExplanationDashboardData } from "@responsible-ai/core-ui";

import { bostonData } from "./bostonData";

export const bostonDataGlobal: IExplanationDashboardData = {
  ...bostonData,
  precomputedExplanations: {
    ...bostonData.precomputedExplanations,
    localFeatureImportance: undefined
  }
};

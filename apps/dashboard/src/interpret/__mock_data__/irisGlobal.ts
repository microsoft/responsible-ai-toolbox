// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IExplanationDashboardData } from "@responsible-ai/core-ui";

import { irisData } from "./irisData";

export const irisGlobal: IExplanationDashboardData = {
  ...irisData,
  precomputedExplanations: {
    ...irisData.precomputedExplanations,
    localFeatureImportance: undefined
  },
  predictedY: undefined,
  probabilityY: undefined,
  testData: undefined,
  trueY: undefined
};

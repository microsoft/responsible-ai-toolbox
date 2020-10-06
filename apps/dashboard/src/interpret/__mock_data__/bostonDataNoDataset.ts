// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IExplanationDashboardData } from "@responsible-ai/interpret";

import { bostonData } from "./bostonData";

export const bostonDataNoDataset: IExplanationDashboardData = {
  ...bostonData,
  testData: undefined
};

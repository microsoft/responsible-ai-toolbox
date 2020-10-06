// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IExplanationDashboardData } from "@responsible-ai/interpret";

import { bostonData } from "./bostonData";

export const bostonDataNoY: IExplanationDashboardData = {
  ...bostonData,
  predictedY: undefined,
  probabilityY: undefined,
  trueY: undefined
};

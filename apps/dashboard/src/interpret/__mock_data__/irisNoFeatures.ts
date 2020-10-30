// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IExplanationDashboardData } from "@responsible-ai/core-ui";

import { irisData } from "./irisData";

export const irisNoFeatures: IExplanationDashboardData = {
  ...irisData,
  dataSummary: { ...irisData.dataSummary, featureNames: undefined }
};

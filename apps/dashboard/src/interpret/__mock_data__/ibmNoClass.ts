// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IExplanationDashboardData } from "@responsible-ai/core-ui";

import { ibmData } from "./ibmData";

export const ibmNoClass: IExplanationDashboardData = {
  ...ibmData,
  dataSummary: { ...ibmData.dataSummary, classNames: undefined }
};

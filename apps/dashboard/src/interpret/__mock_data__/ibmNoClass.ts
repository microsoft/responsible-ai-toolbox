// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IExplanationDashboardData } from "@responsible-ai/interpret";

import { ibmData } from "./ibmData";

export const ibmNoClass: IExplanationDashboardData = {
  ...ibmData,
  dataSummary: { ...ibmData.dataSummary, classNames: undefined }
};

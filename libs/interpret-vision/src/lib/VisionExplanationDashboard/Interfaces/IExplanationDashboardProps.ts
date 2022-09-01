// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IVisionExplanationDashboardData } from "@responsible-ai/core-ui";

export interface IVisionExplanationDashboardProps {
  /*
   * the interface design for the dashboard
   */
  dataSummary: IVisionExplanationDashboardData;
  requestExp?: (index: number, abortSignal: AbortSignal) => Promise<any[]>;
}

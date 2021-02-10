// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export interface IAppConfig {
  dashboardType: "Fairness" | "Interpret" | "DebugML" | "ModelPerformance";
  id: string;
  baseUrl: string;
  withCredentials: boolean;
}

export const config: IAppConfig = JSON.parse(`__rai_config__${""}`);

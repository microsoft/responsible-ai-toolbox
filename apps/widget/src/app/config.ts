// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export interface IAppConfig {
  dashboardType:
    | "Fairness"
    | "Interpret"
    | "ErrorAnalysis"
    | "ModelPerformance"
    | "ModelAssessment";
  id: string;
  baseUrl: string;
  withCredentials: boolean;
  locale: string | undefined;
}

export const config: IAppConfig = JSON.parse("__rai_config__");

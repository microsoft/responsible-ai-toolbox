// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { callFlaskService } from "./callFlaskService";

export interface IAppConfig {
  dashboardType:
    | "Fairness"
    | "Interpret"
    | "ErrorAnalysis"
    | "ModelPerformance"
    | "ResponsibleAI"
    | "Vision";
  id: string;
  baseUrl: string;
  withCredentials: boolean;
  locale: string | undefined;
  featureFlights: string | undefined;
}
export async function getConfig(): Promise<IAppConfig> {
  if (!process.env.NX_based_url) {
    return JSON.parse("__rai_config__");
  }
  const data = await callFlaskService<"", IAppConfig>(
    {
      baseUrl: process.env.NX_based_url,
      withCredentials: false
    },
    "",
    "/config"
  );
  return data;
}

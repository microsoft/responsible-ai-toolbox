// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export interface IAppConfig {
  dashboardType: "Fairness";
  id: string;
  baseUrl: string;
}

export const config: IAppConfig = JSON.parse(`__rai_config__${""}`);

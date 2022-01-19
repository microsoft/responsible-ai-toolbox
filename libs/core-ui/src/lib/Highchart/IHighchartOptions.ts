// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ITheme } from "@fluentui/react";

import { IHighchartsConfig } from "./HighchartTypes";

export interface IHighchartsOptions {
  configOverride?: IHighchartsConfig;
  enabled: boolean;
  theme?: ITheme;
}

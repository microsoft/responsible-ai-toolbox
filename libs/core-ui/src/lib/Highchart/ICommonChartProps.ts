// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ITheme } from "@fluentui/react";

import { IHighchartsConfig } from "./HighchartTypes";

export interface IHighchartsOptions {
  configOverride?: IHighchartsConfig;
  theme?: ITheme;
}
export interface ICommonChartProps<T> {
  className?: string;
  fallback?: React.ReactNode;
  highchartsOptions?: IHighchartsOptions;
  id?: string;
  metric?: T;
  theme?: string;
}

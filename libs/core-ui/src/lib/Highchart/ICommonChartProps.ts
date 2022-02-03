// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ITheme } from "@fluentui/react";

import { IHighchartsConfig } from "./HighchartTypes";

export interface ICommonChartProps {
  id?: string;
  className?: string;
  fallback?: React.ReactNode;
  configOverride?: IHighchartsConfig;
  theme?: ITheme;
}

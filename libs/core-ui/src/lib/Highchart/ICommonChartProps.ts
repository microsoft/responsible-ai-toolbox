// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ITheme } from "@fluentui/react";

import { HighchartsModuleNames } from "./HighchartTypes";
import { IHighchartsConfig } from "./IHighchartsConfig";

export interface ICommonChartProps {
  id?: string;
  className?: string;
  fallback?: React.ReactNode;
  configOverride?: IHighchartsConfig;
  theme?: ITheme;
  modules?: HighchartsModuleNames[];
}

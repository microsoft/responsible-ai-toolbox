// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { AccessorMappingFunctionNames } from "./AccessorMappingFunctionNames";

export interface IAccessor {
  mapArgs?: any[];
  mapFunction?: AccessorMappingFunctionNames;
  path: string[];
  plotlyPath: string;
}

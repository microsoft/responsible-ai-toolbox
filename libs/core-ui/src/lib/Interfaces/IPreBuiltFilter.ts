// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { FilterMethods } from "./IFilter";

export interface IPreBuiltFilter {
  method: FilterMethods;
  arg: any[];
  column: string;
}

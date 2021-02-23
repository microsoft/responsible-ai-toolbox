// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IFilter } from "./IFilter";

export interface ICohort {
  filterList: IFilter[];
  cohortName: string;
}

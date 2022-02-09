// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IPreBuiltFilter } from "./IPreBuiltFilter";

export interface IPreBuiltCohort {
  filterList: IPreBuiltFilter[];
  cohortName: string;
}

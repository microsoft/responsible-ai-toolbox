// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IPreBuiltFilter } from "./IPreBuiltFilter";

export interface IPreBuiltCohort {
  cohort_filter_list: IPreBuiltFilter[];
  name: string;
}

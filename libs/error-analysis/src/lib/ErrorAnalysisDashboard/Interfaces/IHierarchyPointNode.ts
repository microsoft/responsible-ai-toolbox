// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as d3hierarchy from "d3-hierarchy";

// This is to get around a typescript import issue with d3-hierarchy
export type IHierarchyPointNode<TDatum> =
  d3hierarchy.HierarchyPointNode<TDatum>;

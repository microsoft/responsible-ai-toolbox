// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export interface IGlobalSeries {
  unsortedAggregateY: number[];
  // feature x row, given how lookup is done
  unsortedIndividualY?: number[][];
  unsortedFeatureValues?: number[];
  name: string;
  colorIndex: number;
  id?: number;
}

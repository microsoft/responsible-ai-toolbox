// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export interface IVisionListItem {
  [key: string]: string | number | boolean | string[] | number[][];
  image: string;
  predictedY: string | string[];
  trueY: string | string[];
  index: number;
  odIncorrect: string;
  odCorrect: string;
  odAggregate: string;
}

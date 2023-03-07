// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export interface IVisionListItem {
  [key: string]: string | number | boolean | string[] | string[][];
  image: string;
  predictedY: string | string[] | string[][];
  trueY: string | string[] | string[][];
  index: number;
}

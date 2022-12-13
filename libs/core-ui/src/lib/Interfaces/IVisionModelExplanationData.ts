// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export interface IVisionListItem {
  [key: string]: string | number | boolean | string[];
  image: string;
  predictedY: string | string[];
  trueY: string | string[];
  index: number;
}

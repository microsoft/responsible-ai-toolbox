// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export interface IVisionListItem {
  [key: string]: string | number;
  image: string;
  predictedY: string;
  trueY: string;
  index: number;
}

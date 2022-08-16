// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export interface IVisionModelExplanationData {
  classNames?: string[];
  images: string[];
  predictedY?: string[];
  probabilityY?: number[][];
  trueY?: string[];
}

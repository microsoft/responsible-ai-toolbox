// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export interface IVisionListItem {
  [key: string]: string | number | boolean | string[] | number[][] | Map<string, Map<string, number>> | undefined;
  image: string;
  predictedY: string | string[];
  trueY: string | string[];
  index: number;
  odLabels?: Map<string, Map<string, number>>;
}

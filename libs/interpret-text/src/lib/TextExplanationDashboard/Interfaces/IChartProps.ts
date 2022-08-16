// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export interface IChartProps {
  /*
   * interface design for the visual aspects of the dashboard
   */
  text: string[];
  localExplanations: number[];
  topK?: number;
  radio?: string;
}

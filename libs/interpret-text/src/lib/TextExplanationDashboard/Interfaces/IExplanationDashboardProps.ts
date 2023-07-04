// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export interface ITextExplanationDashboardProps {
  /*
   * The interface design for the dashboard
   */
  dataSummary: IDatasetSummary;
  requestQuestionAnsweringMetrics?: (
    selectionIndexes: number[][],
    abortSignal: AbortSignal
  ) => Promise<any[]>;
}

export interface IDatasetSummary {
  /*
   * information about the document given
   */
  text: string[];
  classNames?: string[];
  localExplanations: number[][];
  prediction?: number[];
}

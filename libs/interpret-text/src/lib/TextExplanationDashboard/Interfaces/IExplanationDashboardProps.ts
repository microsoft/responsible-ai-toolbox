// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export interface ITextExplanationDashboardProps {
  /*
   * the interface design for the dashboard
   */
  dataSummary: IDatasetSummary;
}
export interface IDatasetSummary {
  /*
   * information about the document given
   */
  text: string[];
  classNames?: string[];
  localExplanations: number[];
  prediction?: number[];
}

// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export interface IVisionExplanationDashboardProps {
  /*
   * the interface design for the dashboard
   */
  dataSummary: IDatasetSummary;
}

export interface IDatasetSummary {
  /*
   * information about the document given
   */
  images: string[];
  classNames?: string[];
  localExplanations: string[];
  prediction?: number[];
}

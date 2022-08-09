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
<<<<<<< HEAD
  localExplanations: string[];
=======
  localExplanations: number[];
>>>>>>> 46e04a056f03bc313b9772a6b29c79a92f937530
  prediction?: number[];
}

// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export interface IVisionExplanationDashboardProps {
  /*
   * the interface design for the dashboard
   */
  dataSummary: IDatasetSummary;
  requestExp?: (index: number, abortSignal: AbortSignal) => Promise<any[]>;
}

export interface IDatasetSummary {
  /*
   * information about the document given
   */
  modelClass?: ModelClass;
  classNames?: string[];
  images: string[];
  predictedY?: string[];
  probabilityY?: number[][];
  trueY?: string[];
}

export type ModelClass = "Tree" | "EBM" | "blackbox";

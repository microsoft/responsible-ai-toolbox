// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ErrorCohort } from "@responsible-ai/core-ui";

export interface IChartConfigurationFlyoutProps {
  isOpen: boolean;
  onDismissFlyout: () => void;
  datasetCohorts: ErrorCohort[];
  featureBasedCohorts: ErrorCohort[];
  selectedDatasetCohorts?: number[];
  selectedFeatureBasedCohorts?: number[];
  updateCohortSelection: (
    selectedDatasetCohorts: number[],
    selectedFeatureBasedCohorts: number[],
    datasetCohortChartIsSelected: boolean
  ) => void;
  datasetCohortViewIsSelected: boolean;
}

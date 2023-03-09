// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ISelectorConfig } from "../util/IGenericChartProps";
import { ColumnCategories } from "../util/JointDatasetUtils";

export interface IAxisConfigDialogProps {
  orderedGroupTitles: ColumnCategories[];
  selectedColumn: ISelectorConfig;
  canBin: boolean;
  mustBin: boolean;
  canDither: boolean;
  allowTreatAsCategorical: boolean;
  allowLogarithmicScaling?: boolean;
  hideDroppedFeatures?: boolean;
  removeCount?: boolean;
  onAccept: (newConfig: ISelectorConfig) => void;
  onCancel: () => void;
}

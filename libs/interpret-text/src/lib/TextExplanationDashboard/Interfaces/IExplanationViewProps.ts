// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { WeightVectorOption } from "@responsible-ai/core-ui";

import { ITextExplanationDashboardProps } from "./IExplanationDashboardProps";

export interface ITextExplanationViewProps
  extends ITextExplanationDashboardProps {
  /*
   * The interface design for the view
   */
  onWeightChange: (option: WeightVectorOption) => void;
  selectedWeightVector: WeightVectorOption;
  weightOptions: WeightVectorOption[];
  weightLabels: any;
  isQA?: boolean;
}

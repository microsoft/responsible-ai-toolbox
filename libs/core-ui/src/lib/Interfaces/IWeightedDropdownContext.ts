// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IComboBox, IComboBoxOption } from "@fluentui/react";
import React from "react";

export enum WeightVectors {
  Equal = "equal",
  AbsAvg = "absAvg",
  Predicted = "predicted"
}
export type WeightVectorOption =
  | number
  | WeightVectors.Equal
  | WeightVectors.Predicted
  | WeightVectors.AbsAvg;

export interface IWeightedDropdownContext {
  options: IComboBoxOption[];
  selectedKey: WeightVectorOption;
  onSelection: (
    event: React.FormEvent<IComboBox>,
    item?: IComboBoxOption
  ) => void;
}

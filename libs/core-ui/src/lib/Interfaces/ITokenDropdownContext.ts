// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IComboBox, IComboBoxOption } from "@fluentui/react";
import React from "react";

export type TokenOption = number


export interface ITokenDropdownContext {
  options: IComboBoxOption[];
  selectedKey: TokenOption;
  onSelection: (
    event: React.FormEvent<IComboBox>,
    item?: IComboBoxOption
  ) => void;
}

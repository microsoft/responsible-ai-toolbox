// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IComboBoxOption } from "@fluentui/react";
import { localization } from "@responsible-ai/localization";

import { FilterMethods } from "../../Interfaces/IFilter";

export const comparisonOptions: IComboBoxOption[] = [
  {
    key: FilterMethods.Equal,
    text: localization.Interpret.Filters.equalComparison
  },
  {
    key: FilterMethods.GreaterThan,
    text: localization.Interpret.Filters.greaterThanComparison
  },
  {
    key: FilterMethods.GreaterThanEqualTo,
    text: localization.Interpret.Filters.greaterThanEqualToComparison
  },
  {
    key: FilterMethods.LessThan,
    text: localization.Interpret.Filters.lessThanComparison
  },
  {
    key: FilterMethods.LessThanEqualTo,
    text: localization.Interpret.Filters.lessThanEqualToComparison
  },
  {
    key: FilterMethods.InTheRangeOf,
    text: localization.Interpret.Filters.inTheRangeOf
  }
];

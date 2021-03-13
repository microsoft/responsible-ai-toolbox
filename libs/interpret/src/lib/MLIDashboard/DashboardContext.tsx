// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IExplanationContext,
  IWeightedDropdownContext
} from "@responsible-ai/core-ui";
import _ from "lodash";

export interface IDashboardContext {
  explanationContext: IExplanationContext;
  weightContext: IWeightedDropdownContext;
}

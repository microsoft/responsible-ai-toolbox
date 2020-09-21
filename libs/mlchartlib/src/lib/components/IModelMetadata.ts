// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ICategoricalRange } from "./ICategoricalRange";
import { INumericRange } from "./INumericRange";

export interface IModelMetadata {
  featureNames: string[];
  featureNamesAbridged: string[];
  classNames: string[];
  featureIsCategorical?: boolean[];
  featureRanges: Array<INumericRange | ICategoricalRange>;
}

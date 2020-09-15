// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { INumericRange } from "./INumericRange";
import { ICategoricalRange } from "./ICategoricalRange";

export interface IModelMetadata {
  featureNames: string[];
  featureNamesAbridged: string[];
  classNames: string[];
  featureIsCategorical?: boolean[];
  featureRanges: Array<INumericRange | ICategoricalRange>;
}

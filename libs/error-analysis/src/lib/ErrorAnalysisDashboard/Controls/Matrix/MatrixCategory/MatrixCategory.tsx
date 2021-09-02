// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from "react";

import { IMatrixSingleCategory } from "../IMatrixCategory";

export interface IMatrixCategoryProps {
  category: IMatrixSingleCategory[];
  index: number;
}

export class MatrixCategory extends React.PureComponent<IMatrixCategoryProps> {
  public render(): React.ReactNode {
    const cat = this.props.category[this.props.index];
    const value = cat.value;
    if (cat.minIntervalCat !== undefined && cat.maxIntervalCat !== undefined) {
      const minIntervalCat = cat.minIntervalCat;
      const maxIntervalCat = cat.maxIntervalCat;
      return `(${minIntervalCat.toPrecision(3)},${maxIntervalCat.toPrecision(
        3
      )}]`;
    } else if (Number.isFinite(value)) {
      return value.toPrecision(3);
    }
    return value.toString();
  }
}

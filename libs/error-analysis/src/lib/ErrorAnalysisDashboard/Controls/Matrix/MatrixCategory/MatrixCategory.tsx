// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { DirectionalHint, TooltipDelay, TooltipHost } from "@fluentui/react";
import React from "react";

import { IMatrixSingleCategory } from "../IMatrixCategory";

import { matrixCategoryStyles } from "./MatrixCategory.styles";

export interface IMatrixCategoryProps {
  featureName: string | undefined;
  category: IMatrixSingleCategory[];
  index: number;
}

export class MatrixCategory extends React.PureComponent<IMatrixCategoryProps> {
  public render(): React.ReactNode {
    const classNames = matrixCategoryStyles();
    const cat = this.props.category[this.props.index];
    const value = cat.value;
    let categoryName: string;
    if (cat.minIntervalCat !== undefined && cat.maxIntervalCat !== undefined) {
      const minIntervalCat = cat.minIntervalCat;
      const maxIntervalCat = cat.maxIntervalCat;
      categoryName = `(${minIntervalCat.toPrecision(
        3
      )},${maxIntervalCat.toPrecision(3)}]`;
    } else if (Number.isFinite(value)) {
      categoryName = value.toPrecision(3);
    } else {
      categoryName = value.toString();
    }
    return (
      <TooltipHost
        content={`${this.props.featureName}: ${categoryName}`}
        delay={TooltipDelay.zero}
        id={`${this.props.index}_categorytooltip`}
        directionalHint={DirectionalHint.bottomCenter}
        className={classNames.tooltip}
      >
        {categoryName}
      </TooltipHost>
    );
  }
}

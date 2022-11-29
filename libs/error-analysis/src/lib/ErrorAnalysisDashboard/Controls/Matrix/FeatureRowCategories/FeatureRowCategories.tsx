// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IErrorAnalysisMatrix } from "@responsible-ai/core-ui";
import React from "react";

import { IMatrixSingleCategory } from "../IMatrixCategory";
import { MatrixCategory } from "../MatrixCategory/MatrixCategory";

import { featureRowCategoriesStyles } from "./FeatureRowCategories.styles";

export interface IFeatureRowCategoriesProps {
  jsonMatrix: IErrorAnalysisMatrix;
  selectedFeature1?: string;
  selectedFeature2?: string;
  category1Values: IMatrixSingleCategory[];
  sameFeatureSelected: boolean;
}

export class FeatureRowCategories extends React.PureComponent<IFeatureRowCategoriesProps> {
  public render(): React.ReactNode {
    const classNames = featureRowCategoriesStyles();
    return (
      <div key={"category_col"} className={classNames.matrixCol}>
        {this.props.category1Values.map((_, index) => {
          return (
            <div key={`${index}col`} className={classNames.matrixRow}>
              <div
                key={`${index}category1`}
                className={classNames.matrixCellPivot1Categories}
              >
                <MatrixCategory
                  featureName={this.props.selectedFeature1 || ""}
                  category={this.props.category1Values}
                  index={index}
                />
              </div>
            </div>
          );
        })}
      </div>
    );
  }
}

// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from "react";

import { noFeature } from "../../Constants";

import { matrixFooterStyles } from "./MatrixFooter.styles";

export interface IMatrixFooterProps {
  jsonMatrix?: any;
  selectedFeature1: string;
  selectedFeature2: string;
  selectedCells?: boolean[];
  category1Values: any[];
  category2Values: any[];
  sameFeatureSelected: boolean;
  matrixLength: number;
}

export class MatrixFooter extends React.PureComponent<IMatrixFooterProps> {
  public render(): React.ReactNode {
    const classNames = matrixFooterStyles();
    return (
      <div>
        {(this.props.selectedFeature2 === noFeature ||
          this.props.sameFeatureSelected) &&
          this.props.category1Values.length > 0 && (
            <div
              key={`${this.props.matrixLength}row`}
              className={classNames.matrixRow}
            >
              <div
                key={`${this.props.matrixLength}_${0}category1`}
                className={classNames.matrixCellPivot1Categories}
              ></div>
              {this.props.category1Values.map((category: any, i: number) => {
                return (
                  <div
                    key={`${this.props.matrixLength}_${i + 1}category1`}
                    className={classNames.matrixCellPivot2Categories}
                  >
                    {category.value}
                  </div>
                );
              })}
            </div>
          )}
        {this.props.selectedFeature1 !== noFeature &&
          this.props.selectedFeature2 !== noFeature &&
          !this.props.sameFeatureSelected &&
          this.props.category2Values.length > 0 && (
            <div
              key={`${this.props.matrixLength}row`}
              className={classNames.matrixRow}
            >
              <div
                key={`${this.props.matrixLength}_${0}category1`}
                className={classNames.matrixCellPivot1Categories}
              ></div>
              {this.props.category2Values.map((category: any, i: number) => {
                return (
                  <div
                    key={`${this.props.matrixLength}_${i + 1}category2`}
                    className={classNames.matrixCellPivot2Categories}
                  >
                    {category.value}
                  </div>
                );
              })}
            </div>
          )}
      </div>
    );
  }
}

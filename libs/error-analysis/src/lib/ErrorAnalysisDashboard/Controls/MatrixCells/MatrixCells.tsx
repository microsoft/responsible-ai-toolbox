// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { interpolateHcl as d3interpolateHcl } from "d3-interpolate";
import { scaleLinear as d3scaleLinear } from "d3-scale";
import {
  DirectionalHint,
  mergeStyles,
  IStyle,
  ITooltipHostStyles,
  ITooltipProps,
  TooltipDelay,
  TooltipHost
} from "office-ui-fabric-react";
import React from "react";

import { ColorPalette, isColorDark } from "../../ColorPalette";
import { noFeature } from "../../Constants";
import { FilterProps } from "../../FilterProps";
import { FilterTooltip } from "../FilterTooltip/FilterTooltip";

import { matrixCellsStyles } from "./MatrixCells.styles";

export interface IMatrixCellsProps {
  jsonMatrix?: any;
  selectedFeature1: string;
  selectedFeature2: string;
  selectedCells?: boolean[];
  category1Values: any[];
  sameFeatureSelected: boolean;
  selectedCellHandler: (
    i: number,
    j: number,
    matrixLength: number,
    rowLength: number
  ) => void;
}

export class MatrixCells extends React.PureComponent<IMatrixCellsProps> {
  public render(): React.ReactNode {
    const classNames = matrixCellsStyles();
    const topMatrixClass =
      this.props.selectedFeature1 !== noFeature
        ? classNames.matrixRow
        : classNames.matrixCol;

    let falseCount = 0;
    this.props.jsonMatrix.matrix.forEach((row: any) => {
      row.forEach((value: any) => {
        falseCount += value.falseCount;
      });
    });
    const matrixLength = this.props.jsonMatrix.matrix.length;
    return this.props.jsonMatrix.matrix.map((row: any, i: number) => (
      <div key={`${i}row`} className={topMatrixClass}>
        {row.map((value: any, j: number) => {
          let errorRatio = 0;
          let styledGradientMatrixCell: IStyle = classNames.styledMatrixCell;
          if (value.count > 0) {
            errorRatio = (value.falseCount / value.count) * 100;
            const bkgcolor = this.colorLookup(errorRatio);
            const color = this.textColorForBackground(bkgcolor);
            styledGradientMatrixCell = mergeStyles([
              styledGradientMatrixCell,
              {
                background: bkgcolor,
                color
              }
            ]);
          } else {
            styledGradientMatrixCell = mergeStyles([
              styledGradientMatrixCell,
              classNames.nanMatrixCell
            ]);
          }
          if (
            this.props.selectedCells !== undefined &&
            this.props.selectedCells[j + i * row.length]
          ) {
            styledGradientMatrixCell = mergeStyles([
              styledGradientMatrixCell,
              classNames.selectedMatrixCell
            ]);
          }
          const filterProps = new FilterProps(
            value.falseCount,
            value.count,
            falseCount,
            errorRatio
          );
          const tooltipProps: ITooltipProps = {
            onRenderContent: () => (
              <svg width="110" height="140" viewBox="0 0 70 70">
                <FilterTooltip
                  filterProps={filterProps}
                  isMouseOver={true}
                  nodeTransform={"translate(-10px, -10px)"}
                />
              </svg>
            )
          };
          const hostStyles: Partial<ITooltipHostStyles> = {
            root: {
              alignItems: "center",
              display: "flex",
              height: "100%",
              width: "100%"
            }
          };
          const cellData = (
            <div
              key={`${i}_${j}cell`}
              className={classNames.matrixCell}
              onClick={() =>
                this.props.selectedCellHandler(i, j, matrixLength, row.length)
              }
              role="button"
              tabIndex={i}
              onKeyUp={undefined}
            >
              <TooltipHost
                tooltipProps={tooltipProps}
                delay={TooltipDelay.zero}
                id={`${i}_${j}celltooltip`}
                directionalHint={DirectionalHint.bottomCenter}
                styles={hostStyles}
              >
                <div className={styledGradientMatrixCell}>
                  {`${errorRatio.toFixed(0)}%`}
                </div>
              </TooltipHost>
            </div>
          );
          if (this.props.selectedFeature1 === noFeature) {
            const categoryData = (
              <div
                key={`${i}_${j}category1`}
                className={classNames.matrixCellPivot1Categories}
              >
                {this.props.category1Values[j].value}
              </div>
            );
            return (
              <div key={`${j}row`} className={classNames.matrixRow}>
                {categoryData}
                {cellData}
              </div>
            );
          } else if (j === 0) {
            if (
              this.props.selectedFeature2 === noFeature ||
              this.props.sameFeatureSelected
            ) {
              return [
                <div
                  key={`${i}_${j}category1`}
                  className={classNames.matrixCellPivot1Categories}
                ></div>,
                cellData
              ];
            }
            return [
              <div
                key={`${i}_${j}category1`}
                className={classNames.matrixCellPivot1Categories}
              >
                {this.props.category1Values[i].value}
              </div>,
              cellData
            ];
          }
          return cellData;
        })}
      </div>
    ));
  }

  private mapRange(
    outputMin: number,
    outputMax: number,
    value: number
  ): number {
    return outputMin + (outputMax - outputMin) * value;
  }

  private colorgradRatio(value: number): string {
    return d3scaleLinear<string>()
      .domain([0, 1])
      .interpolate(d3interpolateHcl)
      .range([ColorPalette.MinColor, ColorPalette.MaxColor])(value)!;
  }

  private colorLookup(ratio: number): string {
    let result = "#eaeaea";

    if (!ratio) {
      return result;
    }

    const rate = ratio / 100;
    if (rate > 0.01 && rate <= 1) {
      result = this.colorgradRatio(this.mapRange(0, 1, rate));
    } else {
      result = "#ffffff";
    }

    return result;
  }

  private textColorForBackground(colorStr: string): string {
    return isColorDark(colorStr)
      ? ColorPalette.ErrorAnalysisLightText
      : ColorPalette.ErrorAnalysisDarkBlackText;
  }
}

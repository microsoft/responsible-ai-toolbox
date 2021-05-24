// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Metrics } from "@responsible-ai/core-ui";
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

    let totalError = 0;
    let falseCount = 0;
    let maxMetricValue = 0;
    let metricName: string;
    this.props.jsonMatrix.matrix.forEach((row: any) => {
      row.forEach((value: any) => {
        if (value.falseCount) {
          falseCount += value.falseCount;
        } else if (value.metricValue) {
          metricName = value.metricName;
          if (value.metricName === Metrics.MeanSquaredError) {
            totalError += value.metricValue * value.count;
            maxMetricValue = Math.max(maxMetricValue, value.metricValue);
          }
        }
      });
    });
    const matrixLength = this.props.jsonMatrix.matrix.length;
    return this.props.jsonMatrix.matrix.map((row: any, i: number) => (
      <div key={`${i}row`} className={topMatrixClass}>
        {row.map((value: any, j: number) => {
          let errorRatio = 0;
          let styledGradientMatrixCell: IStyle = classNames.styledMatrixCell;
          if (value.count > 0) {
            if (value.falseCount) {
              errorRatio = (value.falseCount / value.count) * 100;
            } else {
              metricName = value.metricName;
              if (value.metricName === Metrics.MeanSquaredError) {
                errorRatio = (value.metricValue / maxMetricValue) * 100;
              }
            }
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
          let error: number;
          let baseError: number;
          let metricValue: number;
          if (value.falseCount) {
            metricValue = errorRatio;
            error = value.falseCount;
            baseError = falseCount;
          } else {
            metricValue = value.metricValue;
            error = value.metricValue * value.count;
            baseError = totalError;
          }
          const filterProps = new FilterProps(
            error,
            value.count,
            baseError,
            metricName,
            metricValue
          );
          const tooltipProps: ITooltipProps = {
            onRenderContent: () => (
              <svg width="110" height="140" viewBox="0 0 70 70">
                <g style={{ transform: "translate(-10px,-10px)" }}>
                  <FilterTooltip filterProps={filterProps} />
                </g>
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
              onClick={(): void =>
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
                />,
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

  private colorgradRatio(value: number): string | undefined {
    return d3scaleLinear<string>()
      .domain([0, 1])
      .interpolate(d3interpolateHcl)
      .range([ColorPalette.MinColor, ColorPalette.MaxColor])(value);
  }

  private colorLookup(ratio: number): string {
    let result = "#eaeaea";

    if (!ratio) {
      return result;
    }

    const rate = ratio / 100;
    if (rate > 0.01 && rate <= 1) {
      result = this.colorgradRatio(this.mapRange(0, 1, rate)) || "#ffffff";
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

// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  DirectionalHint,
  mergeStyles,
  IStyle,
  ITooltipHostStyles,
  ITooltipProps,
  TooltipDelay,
  TooltipHost
} from "@fluentui/react";
import {
  IErrorAnalysisMatrix,
  IErrorAnalysisMatrixNode,
  Metrics
} from "@responsible-ai/core-ui";
import { interpolateHcl as d3interpolateHcl } from "d3-interpolate";
import { scaleLinear as d3scaleLinear } from "d3-scale";
import _ from "lodash";
import React from "react";

import { ColorPalette, isColorDark } from "../../../ColorPalette";
import { FilterProps } from "../../../FilterProps";
import { MetricUtils } from "../../../MetricUtils";
import { FilterTooltip } from "../../FilterTooltip/FilterTooltip";
import { IMatrixSingleCategory } from "../IMatrixCategory";

import { matrixCellsStyles } from "./MatrixCells.styles";

export interface IMatrixCellsProps {
  jsonMatrix: IErrorAnalysisMatrix;
  selectedFeature1?: string;
  selectedFeature2?: string;
  selectedCells?: boolean[];
  category1Values: IMatrixSingleCategory[];
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
    const topMatrixClass: string =
      this.props.selectedFeature1 && !this.props.selectedFeature2
        ? classNames.matrixCol
        : classNames.matrixRow;

    let totalError = 0;
    let falseCount = 0;
    let maxMetricValue = 0;
    let metricName: string = Metrics.ErrorRate;
    for (const row of this.props.jsonMatrix.matrix) {
      for (const value of row) {
        if (value.falseCount !== undefined) {
          falseCount += value.falseCount;
        } else if (value.metricValue !== undefined) {
          metricName = value.metricName;
          if (
            metricName === Metrics.MeanSquaredError ||
            metricName === Metrics.MeanAbsoluteError
          ) {
            totalError += value.metricValue * value.count;
            maxMetricValue = Math.max(maxMetricValue, value.metricValue);
          } else if (
            metricName === Metrics.PrecisionScore ||
            metricName === Metrics.RecallScore ||
            metricName === Metrics.MicroPrecisionScore ||
            metricName === Metrics.MacroPrecisionScore ||
            metricName === Metrics.MicroRecallScore ||
            metricName === Metrics.MacroRecallScore ||
            metricName === Metrics.F1Score ||
            metricName === Metrics.MicroF1Score ||
            metricName === Metrics.MacroF1Score ||
            metricName === Metrics.AccuracyScore
          ) {
            totalError += value.error;
            maxMetricValue = Math.max(maxMetricValue, value.metricValue);
          } else {
            throw new Error(
              `Unknown metric value ${value.metricName} specified`
            );
          }
        }
      }
    }
    const matrixLength = this.props.jsonMatrix.matrix.length;
    return _.map<IErrorAnalysisMatrixNode[], JSX.Element>(
      this.props.jsonMatrix.matrix,
      (row: IErrorAnalysisMatrixNode[], i: number) => (
        <div key={`${i}row`} className={topMatrixClass}>
          {row.map((value, j: number) => {
            let errorRatio = 0;
            let styledGradientMatrixCell: IStyle = classNames.styledMatrixCell;
            metricName = value.metricName ?? Metrics.ErrorRate;
            const isErrorMetric = MetricUtils.isErrorMetricName(metricName);
            if (value.count > 0) {
              if (value.falseCount !== undefined) {
                errorRatio = (value.falseCount / value.count) * 100;
              } else {
                metricName = value.metricName;
                if (metricName !== Metrics.ErrorRate) {
                  errorRatio = (value.metricValue / maxMetricValue) * 100;
                }
              }
              const bkgcolor = this.colorLookup(errorRatio, isErrorMetric);
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
                isErrorMetric
                  ? classNames.nanErrorMatrixCell
                  : classNames.nanMetricMatrixCell
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
            if (value.falseCount !== undefined) {
              metricValue = errorRatio;
              error = value.falseCount;
              baseError = falseCount;
            } else {
              metricValue = value.metricValue;
              if (
                metricName === Metrics.MeanSquaredError ||
                metricName === Metrics.MeanAbsoluteError
              ) {
                error = value.metricValue * value.count;
              } else {
                error = value.error;
              }
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
            if (!this.props.selectedFeature2) {
              return (
                <div key={`${j}row`} className={classNames.matrixRow}>
                  {cellData}
                </div>
              );
            }
            return cellData;
          })}
        </div>
      )
    );
  }

  private mapRange(
    outputMin: number,
    outputMax: number,
    value: number
  ): number {
    return outputMin + (outputMax - outputMin) * value;
  }

  private colorgradRatio(
    value: number,
    isErrorMetric: boolean
  ): string | undefined {
    const minColor = isErrorMetric
      ? ColorPalette.MinErrorColor
      : ColorPalette.MinMetricColor;
    const maxColor = isErrorMetric
      ? ColorPalette.MaxErrorColor
      : ColorPalette.MaxMetricColor;
    return d3scaleLinear<string>()
      .domain([0, 1])
      .interpolate(d3interpolateHcl)
      .range([minColor, maxColor])(value);
  }

  private colorLookup(ratio: number, isErrorMetric: boolean): string {
    let result = "#eaeaea";

    if (!ratio) {
      return result;
    }

    const rate = ratio / 100;
    if (rate > 0.01 && rate <= 1) {
      result =
        this.colorgradRatio(this.mapRange(0, 1, rate), isErrorMetric) ||
        "#ffffff";
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

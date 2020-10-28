// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { lab as Lab } from "d3-color";
import { interpolateHcl as d3interpolateHcl } from "d3-interpolate";
import { scaleLinear as d3scaleLinear } from "d3-scale";
import { mergeStyles, IStyle } from "office-ui-fabric-react";
import React from "react";

import { matrixAreaStyles } from "./MatrixArea.styles";

export interface IMatrixAreaProps {
  theme?: string;
  features: string[];
  selectedFeature1?: string;
  selectedFeature2?: string;
  getMatrix?: (request: any[], abortSignal: AbortSignal) => Promise<any[]>;
}

export interface IMatrixAreaState {
  matrix?: any[];
  maxErrorRate: number;
  selectedCells?: boolean[];
}

export class MatrixArea extends React.PureComponent<
  IMatrixAreaProps,
  IMatrixAreaState
> {
  public constructor(props: IMatrixAreaProps) {
    super(props);
    this.state = {
      matrix: undefined,
      maxErrorRate: 0,
      selectedCells: undefined
    };
    this.fetchMatrix();
  }

  public componentDidUpdate(prevProps: IMatrixAreaProps): void {
    const selectedFeature1Changed =
      this.props.selectedFeature1 !== prevProps.selectedFeature1;
    const selectedFeature2Changed =
      this.props.selectedFeature2 !== prevProps.selectedFeature2;
    if (selectedFeature1Changed || selectedFeature2Changed) {
      this.fetchMatrix();
    }
  }

  public render(): React.ReactNode {
    const classNames = matrixAreaStyles();
    if (
      !this.state.matrix ||
      (this.props.selectedFeature1 === undefined &&
        this.props.selectedFeature2 === undefined)
    ) {
      return <div></div>;
    }
    let rows = 0;
    if (this.props.selectedFeature2 !== undefined) {
      rows = Math.floor((this.state.matrix.length - 1) / 2);
    } else {
      rows = this.state.matrix.length / 2;
    }
    const topPadding = rows * 50 - 14 + 60;
    const styledMatrixLabel: IStyle = mergeStyles([
      classNames.matrixLabel,
      {
        paddingTop: `${topPadding}px`
      }
    ]);
    const matrixLength = this.state.matrix.length;
    return (
      <div className={classNames.matrixArea}>
        <div>
          {this.props.selectedFeature2 !== undefined && (
            <div className={classNames.matrixLabelBottom}>
              <div className={classNames.matrixLabelTab}></div>
              <div>{this.props.selectedFeature2}</div>
            </div>
          )}
          {this.props.selectedFeature2 === undefined && (
            <div className={classNames.emptyLabelPadding}></div>
          )}

          {this.state.matrix.map((row: any, i: number) => (
            <div key={`${i}row`} className={classNames.matrixRow}>
              {row.map((value: any, j: number) => {
                if (j === 0) {
                  if (
                    i === matrixLength - 1 ||
                    this.props.selectedFeature2 === undefined
                  ) {
                    return (
                      <div
                        key={`${i}_${j}category1`}
                        className={classNames.matrixCellPivot1Categories}
                      ></div>
                    );
                  }
                  return (
                    <div
                      key={`${i}_${j}category1`}
                      className={classNames.matrixCellPivot1Categories}
                    >
                      {value.category1}
                    </div>
                  );
                } else if (i === matrixLength - 1) {
                  return (
                    <div
                      key={`${i}_${j}category2`}
                      className={classNames.matrixCellPivot2Categories}
                    >
                      {value.category2}
                    </div>
                  );
                }
                /* Value Cells */
                const errorRatio = (value.falseCount / value.count) * 100;
                const bkgcolor = this.colorLookup(errorRatio);
                const color = this.textColorForBackground(bkgcolor);
                let styledGradientMatrixCell: IStyle = mergeStyles([
                  classNames.styledMatrixCell,
                  {
                    background: bkgcolor,
                    color
                  }
                ]);
                if (
                  this.state.selectedCells !== undefined &&
                  this.state.selectedCells[j + i * row.length]
                ) {
                  styledGradientMatrixCell = mergeStyles([
                    styledGradientMatrixCell,
                    classNames.selectedMatrixCell
                  ]);
                }
                return (
                  <div
                    key={`${i}_${j}cell`}
                    className={classNames.matrixCell}
                    onClick={this.selectedCellHandler.bind(
                      this,
                      i,
                      j,
                      matrixLength,
                      row.length
                    )}
                  >
                    <div className={styledGradientMatrixCell}>
                      {`${errorRatio.toFixed(0)}%`}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        <div className={styledMatrixLabel}>{this.props.selectedFeature1}</div>
      </div>
    );
  }

  private fetchMatrix(): void {
    if (this.props.getMatrix === undefined) {
      return;
    }
    this.props
      .getMatrix(
        [this.props.selectedFeature1!, this.props.selectedFeature2!],
        new AbortController().signal
      )
      .then((result) => {
        this.reloadData(result);
      });
  }

  private reloadData(matrix: any[]): void {
    const maxErrorRate = 0;
    matrix.forEach((row: any): void => {
      row.forEach((value: any): void => {
        Math.max(maxErrorRate, (value.falseCount / value.count) * 100);
      });
    });
    this.setState({
      matrix,
      maxErrorRate,
      selectedCells: undefined
    });
  }

  private selectedCellHandler(
    i: number,
    j: number,
    matrixLength: number,
    rowLength: number
  ): void {
    let selectedCells = this.state.selectedCells;
    if (selectedCells === undefined) {
      selectedCells = new Array<boolean>(matrixLength * rowLength);
    } else {
      // Need to make a copy so setState re-renders
      selectedCells = [...this.state.selectedCells!];
    }
    const index = j + i * rowLength;
    selectedCells[index] = !selectedCells[index];
    this.setState({ selectedCells });
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
      .range(["#F4D1D2", "#8d2323"])(value)!;
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
    return this.isColorDark(colorStr) ? "white" : "rgba(0,0,0,0.8)";
  }

  private isColorDark(colorStr: string): boolean {
    const val = Lab(colorStr).l;
    return val <= 65;
  }
}

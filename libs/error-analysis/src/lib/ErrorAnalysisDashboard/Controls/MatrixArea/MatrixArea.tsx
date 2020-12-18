// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IFilter,
  ICompositeFilter,
  Operations,
  FilterMethods,
  JointDataset
} from "@responsible-ai/interpret";
import { lab as Lab } from "d3-color";
import { interpolateHcl as d3interpolateHcl } from "d3-interpolate";
import { scaleLinear as d3scaleLinear } from "d3-scale";
import { mergeStyles, IStyle, ITheme } from "office-ui-fabric-react";
import React from "react";

import { ErrorCohort, ErrorDetectorCohortSource } from "../../ErrorCohort";

import { matrixAreaStyles } from "./MatrixArea.styles";

export interface IMatrixAreaProps {
  theme?: ITheme;
  features: string[];
  selectedFeature1?: string;
  selectedFeature2?: string;
  getMatrix?: (request: any[], abortSignal: AbortSignal) => Promise<any[]>;
  updateSelectedCohort: (
    filters: IFilter[],
    compositeFilters: ICompositeFilter[],
    source: ErrorDetectorCohortSource,
    cells: number
  ) => void;
  selectedCohort: ErrorCohort;
  baseCohort: ErrorCohort;
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
    if (
      selectedFeature1Changed ||
      selectedFeature2Changed ||
      this.props.baseCohort !== prevProps.baseCohort
    ) {
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
                let errorRatio = 0;
                let styledGradientMatrixCell: IStyle =
                  classNames.styledMatrixCell;
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
                    role="button"
                    tabIndex={i}
                    onKeyUp={undefined}
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
    const filtersRelabeled = ErrorCohort.getLabeledFilters(
      this.props.baseCohort.cohort.filters,
      this.props.baseCohort.jointDataset
    );
    const compositeFiltersRelabeled = ErrorCohort.getLabeledCompositeFilters(
      this.props.baseCohort.cohort.compositeFilters,
      this.props.baseCohort.jointDataset
    );
    this.props
      .getMatrix(
        [
          [this.props.selectedFeature1!, this.props.selectedFeature2!],
          filtersRelabeled,
          compositeFiltersRelabeled
        ],
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
    // Create a composite filter from the selected cells
    const compositeFilter = this.createCompositeFilterFromCells(
      selectedCells,
      this.state.matrix!
    );
    const cells = selectedCells.filter(Boolean).length;
    this.props.updateSelectedCohort(
      [],
      compositeFilter,
      ErrorDetectorCohortSource.HeatMap,
      cells
    );
  }

  private getKey(feature: string): string {
    const index = this.props.features.indexOf(feature);
    return JointDataset.DataLabelRoot + index.toString();
  }

  private createCompositeFilterFromCells(
    selectedCells: boolean[],
    matrix: any[]
  ): ICompositeFilter[] {
    const category1Values = [];
    let cat1HasIntervals = false;
    let cat2HasIntervals = false;
    // Extract categories for first selected feature in matrix filter
    for (let i = 0; i < matrix.length - 1; i++) {
      const cellCat1 = matrix[i][0];
      const category1 = cellCat1.category1;
      if ("intervalMin" in cellCat1 && "intervalMax" in cellCat1) {
        const minIntervalCat1 = cellCat1.intervalMin;
        const maxIntervalCat1 = cellCat1.intervalMax;
        category1Values.push({ category1, maxIntervalCat1, minIntervalCat1 });
        cat1HasIntervals = true;
      } else {
        category1Values.push({ category1 });
        cat2HasIntervals = false;
      }
    }
    const category2Values = [];
    const rowLength = matrix[0].length;
    // Extract categories for second selected feature in matrix filter
    for (let i = 1; i < rowLength; i++) {
      const cellCat2 = matrix[matrix.length - 1][i];
      const category2 = cellCat2.category2;
      if ("intervalMin" in cellCat2 && "intervalMax" in cellCat2) {
        const minIntervalCat2 = cellCat2.intervalMin;
        const maxIntervalCat2 = cellCat2.intervalMax;
        category2Values.push({ category2, maxIntervalCat2, minIntervalCat2 });
        cat2HasIntervals = true;
      } else {
        category2Values.push({ category2 });
        cat2HasIntervals = false;
      }
    }
    const multiCellCompositeFilters: ICompositeFilter[] = [];
    const keyFeature1 = this.getKey(this.props.selectedFeature1!);
    let keyFeature2 = this.getKey(this.props.selectedFeature2!);
    // Create filters based on the selected cells in the matrix filter
    for (let i = 0; i < matrix.length - 1; i++) {
      for (let j = 1; j < rowLength; j++) {
        const index = j + i * rowLength;
        const cellCompositeFilters: ICompositeFilter[] = [];
        if (selectedCells[index]) {
          if (category1Values.length > 0) {
            if (cat1HasIntervals) {
              cellCompositeFilters.push({
                arg: [
                  category1Values[i].minIntervalCat1,
                  category1Values[i].maxIntervalCat1
                ],
                column: keyFeature1,
                method: FilterMethods.InTheRangeOf
              });
            } else {
              let cat1arg = category1Values[i].category1;
              if (typeof cat1arg == "string") {
                cat1arg = i;
              }
              cellCompositeFilters.push({
                arg: [cat1arg],
                column: keyFeature1,
                method: FilterMethods.Equal
              });
            }
          } else {
            keyFeature2 = keyFeature1;
          }
          if (cat2HasIntervals) {
            cellCompositeFilters.push({
              arg: [
                category2Values[j - 1].minIntervalCat2,
                category2Values[j - 1].maxIntervalCat2
              ],
              column: keyFeature2,
              method: FilterMethods.InTheRangeOf
            });
          } else {
            let cat2arg = category2Values[j - 1].category2;
            if (typeof cat2arg == "string") {
              cat2arg = j - 1;
            }
            cellCompositeFilters.push({
              arg: [cat2arg],
              column: keyFeature2,
              method: FilterMethods.Equal
            });
          }
          const singleCellCompositeFilter: ICompositeFilter = {
            compositeFilters: cellCompositeFilters,
            operation: Operations.And
          };
          multiCellCompositeFilters.push(singleCellCompositeFilter);
        }
      }
    }
    const compositeFilters: ICompositeFilter[] = [];
    if (multiCellCompositeFilters.length > 0) {
      const multiCompositeFilter: ICompositeFilter = {
        compositeFilters: multiCellCompositeFilters,
        operation: Operations.Or
      };
      compositeFilters.push(multiCompositeFilter);
    }
    return compositeFilters;
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

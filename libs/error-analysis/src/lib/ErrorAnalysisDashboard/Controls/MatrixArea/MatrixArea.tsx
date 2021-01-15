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
import {
  DirectionalHint,
  mergeStyles,
  IStyle,
  ITheme,
  ITooltipHostStyles,
  ITooltipProps,
  TooltipDelay,
  TooltipHost
} from "office-ui-fabric-react";
import React from "react";

import { ColorPalette } from "../../ColorPalette";
import { noFeature } from "../../Constants";
import { ErrorCohort, ErrorDetectorCohortSource } from "../../ErrorCohort";
import { FilterProps } from "../../FilterProps";
import { FilterTooltip } from "../FilterTooltip/FilterTooltip";

import { matrixAreaStyles } from "./MatrixArea.styles";

export interface IMatrixAreaProps {
  theme?: ITheme;
  features: string[];
  selectedFeature1: string;
  selectedFeature2: string;
  getMatrix?: (request: any, abortSignal: AbortSignal) => Promise<any>;
  updateSelectedCohort: (
    filters: IFilter[],
    compositeFilters: ICompositeFilter[],
    source: ErrorDetectorCohortSource,
    cells: number
  ) => void;
  selectedCohort: ErrorCohort;
  baseCohort: ErrorCohort;
  updateMatrixLegendState: (maxError: number) => void;
}

export interface IMatrixAreaState {
  jsonMatrix?: any;
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
      jsonMatrix: undefined,
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
      !this.state.jsonMatrix ||
      (this.props.selectedFeature1 === noFeature &&
        this.props.selectedFeature2 === noFeature)
    ) {
      return <div></div>;
    }
    let rows = 0;
    if (this.props.selectedFeature2 !== noFeature) {
      rows = Math.floor((this.state.jsonMatrix.matrix.length - 1) / 2);
    } else {
      rows = this.state.jsonMatrix.matrix.length / 2;
    }
    const topPadding = rows * 50 - 14 + 60;
    const styledMatrixLabel: IStyle = mergeStyles([
      classNames.matrixLabel,
      {
        paddingTop: `${topPadding}px`
      }
    ]);
    const matrixLength = this.state.jsonMatrix.matrix.length;
    // Extract categories
    const [category1Values] = this.extractCategories(
      this.state.jsonMatrix.category1
    );
    const [category2Values] = this.extractCategories(
      this.state.jsonMatrix.category2
    );
    return (
      <div className={classNames.matrixArea}>
        <div>
          {this.props.selectedFeature2 !== noFeature && (
            <div className={classNames.matrixLabelBottom}>
              <div className={classNames.matrixLabelTab}></div>
              <div>{this.props.selectedFeature2}</div>
            </div>
          )}
          {this.props.selectedFeature2 === noFeature && (
            <div className={classNames.emptyLabelPadding}></div>
          )}

          {this.state.jsonMatrix.matrix.map((row: any, i: number) => (
            <div key={`${i}row`} className={classNames.matrixRow}>
              {row.map((value: any, j: number) => {
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
                const filterProps = new FilterProps(
                  value.falseCount,
                  value.count,
                  this.props.baseCohort.totalIncorrect,
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
                      {category1Values[j].value}
                    </div>
                  );
                  if (j !== 0) {
                    return [
                      <div
                        key={`${j}row`}
                        className={classNames.matrixRow}
                      ></div>,
                      categoryData,
                      cellData
                    ];
                  }
                  return [categoryData, cellData];
                } else if (j === 0) {
                  if (this.props.selectedFeature2 === noFeature) {
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
                      {category1Values[i].value}
                    </div>,
                    cellData
                  ];
                }
                return cellData;
              })}
            </div>
          ))}
          {this.props.selectedFeature2 === noFeature &&
            category1Values.length > 0 && (
              <div key={`${matrixLength}row`} className={classNames.matrixRow}>
                <div
                  key={`${matrixLength}_${0}category1`}
                  className={classNames.matrixCellPivot1Categories}
                ></div>
                {category1Values.map((category: any, i: number) => {
                  return (
                    <div
                      key={`${matrixLength}_${i + 1}category1`}
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
            category2Values.length > 0 && (
              <div key={`${matrixLength}row`} className={classNames.matrixRow}>
                <div
                  key={`${matrixLength}_${0}category1`}
                  className={classNames.matrixCellPivot1Categories}
                ></div>
                {category2Values.map((category: any, i: number) => {
                  return (
                    <div
                      key={`${matrixLength}_${i + 1}category2`}
                      className={classNames.matrixCellPivot2Categories}
                    >
                      {category.value}
                    </div>
                  );
                })}
              </div>
            )}
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
    let selectedFeature1: string | undefined = this.props.selectedFeature1;
    if (this.props.selectedFeature1 === noFeature) {
      selectedFeature1 = undefined;
    }
    let selectedFeature2: string | undefined = this.props.selectedFeature2;
    // Note: edge case, if both features selected are the same one, show just a row
    if (
      this.props.selectedFeature2 === noFeature ||
      (this.props.selectedFeature2 === this.props.selectedFeature1 &&
        selectedFeature1 !== undefined)
    ) {
      selectedFeature2 = undefined;
    }
    this.props
      .getMatrix(
        [
          [selectedFeature1, selectedFeature2],
          filtersRelabeled,
          compositeFiltersRelabeled
        ],
        new AbortController().signal
      )
      .then((result) => {
        this.reloadData(result);
      });
  }

  private reloadData(jsonMatrix: any): void {
    let maxErrorRate = 0;
    jsonMatrix.matrix.forEach((row: any): void => {
      row.forEach((value: any): void => {
        const errorRate = value.falseCount / value.count;
        if (!Number.isNaN(errorRate)) {
          maxErrorRate = Math.max(maxErrorRate, errorRate);
        }
      });
    });
    this.props.updateMatrixLegendState(maxErrorRate);
    this.setState({
      jsonMatrix,
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
      this.state.jsonMatrix!
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

  private extractCategories(category: any): [any[], boolean] {
    if (category === undefined) {
      return [[], false];
    }
    const categoryValues = [];
    let catHasIntervals = false;
    for (let i = 0; i < category.values.length; i++) {
      const value = category.values[i];
      if (
        "intervalMin" in category &&
        "intervalMax" in category &&
        category.intervalMin.length > 0 &&
        category.intervalMax.length > 0
      ) {
        const minIntervalCat = category.intervalMin[i];
        const maxIntervalCat = category.intervalMax[i];
        categoryValues.push({ maxIntervalCat, minIntervalCat, value });
        catHasIntervals = true;
      } else {
        categoryValues.push({ value });
        catHasIntervals = false;
      }
    }
    return [categoryValues, catHasIntervals];
  }

  private createCompositeFilterFromCells(
    selectedCells: boolean[],
    jsonMatrix: any
  ): ICompositeFilter[] {
    const feature2IsSelected = this.props.selectedFeature2 !== noFeature;
    // Extract categories
    const [category1Values, cat1HasIntervals] = this.extractCategories(
      jsonMatrix.category1
    );
    const [category2Values, cat2HasIntervals] = this.extractCategories(
      jsonMatrix.category2
    );
    const numCols = feature2IsSelected
      ? jsonMatrix.matrix[0].length
      : jsonMatrix.matrix.length;
    const numRows = feature2IsSelected
      ? jsonMatrix.matrix.length
      : jsonMatrix.matrix[0].length;
    const multiCellCompositeFilters: ICompositeFilter[] = [];
    const keyFeature1 = this.getKey(this.props.selectedFeature1);
    let keyFeature2 = undefined;
    if (feature2IsSelected) {
      keyFeature2 = this.getKey(this.props.selectedFeature2);
    }
    // Create filters based on the selected cells in the matrix filter
    for (let i = 0; i < numRows; i++) {
      for (let j = 0; j < numCols; j++) {
        const index = j + i * numCols;
        const cellCompositeFilters: ICompositeFilter[] = [];
        if (selectedCells[index]) {
          if (category1Values.length > 0) {
            if (cat1HasIntervals) {
              cellCompositeFilters.push({
                arg: [
                  category1Values[i].minIntervalCat,
                  category1Values[i].maxIntervalCat
                ],
                column: keyFeature1,
                method: FilterMethods.InTheRangeOf
              });
            } else {
              let cat1arg = category1Values[i].value;
              if (typeof cat1arg == "string") {
                cat1arg = this.props.baseCohort.jointDataset.metaDict[
                  keyFeature1
                ].sortedCategoricalValues?.indexOf(cat1arg);
              }
              cellCompositeFilters.push({
                arg: [cat1arg],
                column: keyFeature1,
                method: FilterMethods.Equal
              });
            }
          }
          if (category2Values.length > 0) {
            if (cat2HasIntervals) {
              cellCompositeFilters.push({
                arg: [
                  category2Values[j].minIntervalCat,
                  category2Values[j].maxIntervalCat
                ],
                column: keyFeature2!,
                method: FilterMethods.InTheRangeOf
              });
            } else {
              let cat2arg = category2Values[j].value;
              if (typeof cat2arg == "string") {
                cat2arg = this.props.baseCohort.jointDataset.metaDict[
                  keyFeature2!
                ].sortedCategoricalValues?.indexOf(cat2arg);
              }
              cellCompositeFilters.push({
                arg: [cat2arg],
                column: keyFeature2!,
                method: FilterMethods.Equal
              });
            }
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
    return this.isColorDark(colorStr) ? "white" : "rgba(0,0,0,0.8)";
  }

  private isColorDark(colorStr: string): boolean {
    const val = Lab(colorStr).l;
    return val <= 65;
  }
}

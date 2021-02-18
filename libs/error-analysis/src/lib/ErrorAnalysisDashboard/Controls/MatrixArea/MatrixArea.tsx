// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IFilter,
  ICompositeFilter,
  Operations,
  FilterMethods,
  JointDataset
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import { interpolateHcl as d3interpolateHcl } from "d3-interpolate";
import { scaleLinear as d3scaleLinear } from "d3-scale";
import {
  DefaultButton,
  DirectionalHint,
  mergeStyles,
  IStackStyles,
  IStackTokens,
  IStyle,
  ITheme,
  ITooltipHostStyles,
  ITooltipProps,
  Stack,
  Text,
  TooltipDelay,
  TooltipHost
} from "office-ui-fabric-react";
import React from "react";

import { CohortStats } from "../../CohortStats";
import { ColorPalette, isColorDark } from "../../ColorPalette";
import { noFeature } from "../../Constants";
import { ErrorCohort, ErrorDetectorCohortSource } from "../../ErrorCohort";
import { FilterProps } from "../../FilterProps";
import { IMatrixAreaState } from "../../MatrixFilterState";
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
    cells: number,
    cohortStats: CohortStats | undefined
  ) => void;
  selectedCohort: ErrorCohort;
  baseCohort: ErrorCohort;
  updateMatrixLegendState: (maxError: number) => void;
  state: IMatrixAreaState;
  setMatrixAreaState: (matrixAreaState: IMatrixAreaState) => void;
}

const emptyTextStyle: IStackStyles = {
  root: {
    width: 300
  }
};

const emptyTextPadding: IStackTokens = { padding: "10px 0px 0px 0px" };

const stackTokens: IStackTokens = { childrenGap: 5 };

export class MatrixArea extends React.PureComponent<
  IMatrixAreaProps,
  IMatrixAreaState
> {
  public constructor(props: IMatrixAreaProps) {
    super(props);
    this.state = {
      disableClearAll: this.props.state.disableClearAll,
      disableSelectAll: this.props.state.disableSelectAll,
      jsonMatrix: this.props.state.jsonMatrix,
      matrixFeature1: this.props.selectedFeature1,
      matrixFeature2: this.props.selectedFeature2,
      maxErrorRate: this.props.state.maxErrorRate,
      selectedCells: this.props.state.selectedCells
    };
    if (this.props.state.selectedCells === undefined) {
      this.fetchMatrix();
    }
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

  public componentWillUnmount(): void {
    this.props.setMatrixAreaState(this.state);
  }

  public render(): React.ReactNode {
    const classNames = matrixAreaStyles();
    // Note: we render as empty if:
    // 1.) there is no matrix
    // 2.) all features set to empty
    // 3.) when user first changes feature a render is triggered but componentDidUpdate
    // is only called after initial render is done, which would be an inconsistent state
    // Note in third case we just show empty and not the help text
    if (
      !this.state.jsonMatrix ||
      (this.props.selectedFeature1 === noFeature &&
        this.props.selectedFeature2 === noFeature)
    ) {
      return (
        <Stack styles={emptyTextStyle} tokens={emptyTextPadding}>
          <Text variant="medium">
            {localization.ErrorAnalysis.MatrixArea.emptyText}
          </Text>
        </Stack>
      );
    }
    if (
      this.state.matrixFeature1 !== this.props.selectedFeature1 ||
      this.state.matrixFeature2 !== this.props.selectedFeature2
    ) {
      return <div></div>;
    }
    const sameFeatureSelected =
      this.props.selectedFeature1 === this.props.selectedFeature2;
    let rows = 0;
    if (this.props.selectedFeature2 !== noFeature && !sameFeatureSelected) {
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
    const matrixRowLength = this.state.jsonMatrix.matrix[0].length;
    // Extract categories
    const [category1Values] = this.extractCategories(
      this.state.jsonMatrix.category1
    );
    const [category2Values] = this.extractCategories(
      this.state.jsonMatrix.category2
    );
    const topMatrixClass =
      this.props.selectedFeature1 !== noFeature
        ? classNames.matrixRow
        : classNames.matrixCol;
    let falseCount = 0;
    this.state.jsonMatrix.matrix.forEach((row: any) => {
      row.forEach((value: any) => {
        falseCount += value.falseCount;
      });
    });
    return (
      <Stack>
        <Stack horizontal tokens={stackTokens}>
          <DefaultButton
            text={localization.ErrorAnalysis.MatrixArea.clearAll}
            onClick={this.clearAll.bind(this, matrixLength, matrixRowLength)}
            disabled={this.state.disableClearAll}
          />
          <DefaultButton
            text={localization.ErrorAnalysis.MatrixArea.selectAll}
            onClick={this.selectAll.bind(this, matrixLength, matrixRowLength)}
            disabled={this.state.disableSelectAll}
          />
        </Stack>
        <div className={classNames.matrixArea}>
          <div>
            {this.props.selectedFeature2 !== noFeature && !sameFeatureSelected && (
              <div className={classNames.matrixLabelBottom}>
                <div className={classNames.matrixLabelTab}></div>
                <div>{this.props.selectedFeature2}</div>
              </div>
            )}
            {(this.props.selectedFeature2 === noFeature ||
              sameFeatureSelected) && (
              <div className={classNames.emptyLabelPadding}></div>
            )}

            {this.state.jsonMatrix.matrix.map((row: any, i: number) => (
              <div key={`${i}row`} className={topMatrixClass}>
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
                    return (
                      <div key={`${j}row`} className={classNames.matrixRow}>
                        {categoryData}
                        {cellData}
                      </div>
                    );
                  } else if (j === 0) {
                    if (
                      this.props.selectedFeature2 === noFeature ||
                      sameFeatureSelected
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
                        {category1Values[i].value}
                      </div>,
                      cellData
                    ];
                  }
                  return cellData;
                })}
              </div>
            ))}
            {(this.props.selectedFeature2 === noFeature ||
              sameFeatureSelected) &&
              category1Values.length > 0 && (
                <div
                  key={`${matrixLength}row`}
                  className={classNames.matrixRow}
                >
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
              !sameFeatureSelected &&
              category2Values.length > 0 && (
                <div
                  key={`${matrixLength}row`}
                  className={classNames.matrixRow}
                >
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
          {this.props.selectedFeature1 !== noFeature && (
            <div className={styledMatrixLabel}>
              {this.props.selectedFeature1}
            </div>
          )}
        </div>
      </Stack>
    );
  }

  private fetchMatrix(): void {
    if (
      this.props.getMatrix === undefined ||
      (this.props.selectedFeature1 === noFeature &&
        this.props.selectedFeature2 === noFeature)
    ) {
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
      disableClearAll: true,
      disableSelectAll: false,
      jsonMatrix,
      matrixFeature1: this.props.selectedFeature1,
      matrixFeature2: this.props.selectedFeature2,
      maxErrorRate,
      selectedCells: undefined
    });
  }

  private selectAll(matrixLength: number, rowLength: number): void {
    const size = matrixLength * rowLength;
    const selectedCells = new Array<boolean>(size);
    for (let i = 0; i < size; i++) {
      selectedCells[i] = true;
    }
    this.setState({
      disableClearAll: false,
      disableSelectAll: true,
      selectedCells
    });
    this.updateStateFromSelectedCells(selectedCells);
  }

  private clearAll(matrixLength: number, rowLength: number): void {
    const size = matrixLength * rowLength;
    const selectedCells = new Array<boolean>(size);
    this.setState({
      disableClearAll: true,
      disableSelectAll: false,
      selectedCells
    });
    this.updateStateFromSelectedCells(selectedCells);
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
    let disableClearAll = false;
    let disableSelectAll = false;
    if (selectedCells.every((value) => value)) {
      disableClearAll = false;
      disableSelectAll = true;
    } else if (selectedCells.every((value) => !value)) {
      disableClearAll = true;
      disableSelectAll = false;
    }
    this.setState({
      disableClearAll,
      disableSelectAll,
      selectedCells
    });
    this.updateStateFromSelectedCells(selectedCells);
  }

  private updateStateFromSelectedCells(selectedCells: boolean[]) {
    // Create a composite filter from the selected cells
    const compositeFilter = this.createCompositeFilterFromCells(
      selectedCells,
      this.state.jsonMatrix!
    );
    const cells = selectedCells.filter(Boolean).length;
    const cohortStats = this.createCohortStatsFromSelectedCells(selectedCells);
    this.props.updateSelectedCohort(
      [],
      compositeFilter,
      ErrorDetectorCohortSource.HeatMap,
      cells,
      cohortStats
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

  private createCohortStatsFromSelectedCells(
    selectedCells: boolean[]
  ): CohortStats {
    let falseCohortCount = 0;
    let totalCohortCount = 0;
    let falseCount = 0;
    let totalCount = 0;
    let existsSelectedCell = false;
    this.state.jsonMatrix.matrix.forEach((row: any, i: number) => {
      row.forEach((value: any, j: number) => {
        if (selectedCells !== undefined && selectedCells[j + i * row.length]) {
          falseCohortCount += value.falseCount;
          totalCohortCount += value.count;
          existsSelectedCell = true;
        }
        falseCount += value.falseCount;
        totalCount += value.count;
      });
    });
    if (existsSelectedCell) {
      const errorRate = (falseCohortCount / totalCohortCount) * 100;
      return new CohortStats(
        falseCohortCount,
        totalCohortCount,
        falseCount,
        totalCount,
        errorRate
      );
    }
    const errorRate = (falseCount / totalCount) * 100;
    return new CohortStats(
      falseCount,
      totalCount,
      falseCount,
      totalCount,
      errorRate
    );
  }

  private createCompositeFilterFromCells(
    selectedCells: boolean[],
    jsonMatrix: any
  ): ICompositeFilter[] {
    const feature2IsSelected =
      this.props.selectedFeature2 !== noFeature &&
      this.props.selectedFeature2 !== this.props.selectedFeature1;
    // Extract categories
    let [category1Values, cat1HasIntervals] = this.extractCategories(
      jsonMatrix.category1
    );
    let [category2Values, cat2HasIntervals] = this.extractCategories(
      jsonMatrix.category2
    );
    const numCols = feature2IsSelected
      ? jsonMatrix.matrix[0].length
      : jsonMatrix.matrix.length;
    const numRows = feature2IsSelected
      ? jsonMatrix.matrix.length
      : jsonMatrix.matrix[0].length;
    const multiCellCompositeFilters: ICompositeFilter[] = [];
    let keyFeature1 = undefined;
    let keyFeature2 = undefined;
    if (feature2IsSelected && this.props.selectedFeature1 === noFeature) {
      // Vertical case, where feature 2 is selected and feature 1 is not
      keyFeature2 = this.getKey(this.props.selectedFeature2);
      category2Values = category1Values;
      cat2HasIntervals = cat1HasIntervals;
      category1Values = [];
      cat1HasIntervals = false;
    } else {
      keyFeature1 = this.getKey(this.props.selectedFeature1);
      if (feature2IsSelected) {
        keyFeature2 = this.getKey(this.props.selectedFeature2);
      }
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
                column: keyFeature1!,
                method: FilterMethods.InTheRangeOf
              });
            } else {
              let cat1arg = category1Values[i].value;
              if (typeof cat1arg == "string") {
                cat1arg = this.props.baseCohort.jointDataset.metaDict[
                  keyFeature1!
                ].sortedCategoricalValues?.indexOf(cat1arg);
              }
              cellCompositeFilters.push({
                arg: [cat1arg],
                column: keyFeature1!,
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
    return isColorDark(colorStr)
      ? ColorPalette.ErrorAnalysisLightText
      : ColorPalette.ErrorAnalysisDarkBlackText;
  }
}

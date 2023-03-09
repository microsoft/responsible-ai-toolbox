// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IFilter,
  FilterMethods,
  ICompositeFilter,
  Operations
} from "../Interfaces/IFilter";
import { compare } from "../util/compare";
import { JointDataset } from "../util/JointDataset";
import { ModelExplanationUtils } from "../util/ModelExplanationUtils";

export class Cohort {
  private static _cohortIndex = 0;

  public filteredData: Array<{ [key: string]: number }>;
  private readonly cohortIndex: number;
  private cachedAverageImportance: number[] | undefined;
  private cachedTransposedLocalFeatureImportances: number[][] | undefined;
  private currentSortKey: undefined | string;
  private currentSortReversed = false;

  public constructor(
    public name: string,
    private jointDataset: JointDataset,
    public filters: IFilter[] = [],
    public compositeFilters: ICompositeFilter[] = []
  ) {
    this.cohortIndex = Cohort._cohortIndex;
    this.name = name;
    Cohort._cohortIndex += 1;
    this.filteredData = this.applyFilters();
  }

  public static getLabeledFilters(
    filters: IFilter[],
    jointDataset: JointDataset
  ): IFilter[] {
    // return the filters relabeled from Data# to original label
    const filtersRelabeled = filters
      .filter((item) => item)
      .map((filter: IFilter): IFilter => {
        const label = jointDataset.metaDict[filter.column].label;
        return {
          arg: filter.arg,
          column: label,
          method: filter.method
        };
      });
    return filtersRelabeled;
  }

  public static getLabeledCompositeFilters(
    compositeFilters: ICompositeFilter[],
    jointDataset: JointDataset
  ): ICompositeFilter[] {
    // return the filters relabeled from Data# to original label
    const filtersRelabeled = compositeFilters.map(
      (compositeFilter: ICompositeFilter): ICompositeFilter => {
        if (compositeFilter.method) {
          return Cohort.getLabeledFilters(
            [compositeFilter as IFilter],
            jointDataset
          )[0] as ICompositeFilter;
        }
        return {
          compositeFilters: Cohort.getLabeledCompositeFilters(
            compositeFilter.compositeFilters,
            jointDataset
          ),
          operation: compositeFilter.operation
        } as ICompositeFilter;
      }
    );
    return filtersRelabeled;
  }

  public updateFilter(filter: IFilter, index?: number): void {
    if (index === undefined) {
      index = this.filters.length;
    }

    this.filters[index] = filter;
    this.filteredData = this.applyFilters();
  }

  // An id to track if a change requiring re-render has occurred.
  public getCohortID(): number {
    return this.cohortIndex;
  }

  public deleteFilter(index: number): void {
    this.filters.splice(index, 1);
    this.filteredData = this.applyFilters();
  }

  public getRow(index: number): { [key: string]: number } {
    const dataDict = this.jointDataset.dataDict?.[index];
    const convertedDataDict: { [key: string]: number } = {};
    if (dataDict) {
      for (const key in dataDict) {
        convertedDataDict[key] = Number(dataDict[key]);
      }
    }
    return convertedDataDict;
  }

  public sort(
    columnName: string = JointDataset.IndexLabel,
    reverse?: boolean
  ): void {
    if (this.currentSortKey !== columnName) {
      this.filteredData.sort((a, b) => {
        return compare(a[columnName], b[columnName]);
      });
      this.currentSortKey = columnName;
      this.currentSortReversed = false;
    }
    if (reverse === undefined) {
      reverse = false;
    }
    if (this.currentSortReversed !== reverse) {
      this.filteredData.reverse();
      this.currentSortReversed = true;
    }
  }

  public sortByGroup(
    columnName: string = JointDataset.IndexLabel,
    groupingFunction: (row: any) => boolean
  ): void {
    this.filteredData.sort((a, b) => {
      const columnDifference = compare(a[columnName], b[columnName]);
      if (groupingFunction(a) === groupingFunction(b)) {
        return columnDifference;
      }
      // 10000 is used as a large enough constant to ensure that the
      // importance of the grouping is higher than column difference
      if (groupingFunction(a)) {
        return -10000 + columnDifference;
      }
      return 10000 + columnDifference;
    });
  }

  // whether to apply bins is a decision made at the ui control level,
  // should not mutate the true dataset. Instead, bin props are preserved
  // and applied when requested.
  // Bin object stores array of upper bounds for each bin, return the index
  // of the bin of the value;
  public unwrap(key: string, applyBin?: boolean): any[] {
    if (
      applyBin &&
      !this.jointDataset.metaDict[key].isCategorical &&
      !this.jointDataset.metaDict[key]?.treatAsCategorical
    ) {
      let binVector = this.jointDataset.binDict[key];
      if (binVector === undefined) {
        this.jointDataset.addBin(key);
        binVector = this.jointDataset.binDict[key];
      }
      return this.filteredData.map((row) => {
        const rowValue = row[key];
        return binVector?.findIndex((upperLimit) => upperLimit >= rowValue);
      });
    }
    return this.filteredData.map((row) => row[key]);
  }

  public calculateAverageImportance(): number[] {
    if (this.cachedAverageImportance) {
      return this.cachedAverageImportance;
    }

    this.cachedAverageImportance = this.transposedLocalFeatureImportances().map(
      (featureValues) => {
        if (!featureValues || featureValues.length === 0) {
          return Number.NaN;
        }
        const total = featureValues.reduce((prev, current) => {
          return prev + Math.abs(current);
        }, 0);
        return total / featureValues.length;
      }
    );
    return this.cachedAverageImportance;
  }

  public transposedLocalFeatureImportances(): number[][] {
    if (this.cachedTransposedLocalFeatureImportances) {
      return this.cachedTransposedLocalFeatureImportances;
    }
    const featureLength = this.jointDataset.localExplanationFeatureCount;
    const localFeatureImportances = this.filteredData.map((row) => {
      return JointDataset.localExplanationSlice(row, featureLength);
    });
    if (localFeatureImportances.length === 0) {
      return [];
    }
    this.cachedTransposedLocalFeatureImportances =
      ModelExplanationUtils.transpose2DArray(localFeatureImportances);
    return this.cachedTransposedLocalFeatureImportances;
  }

  public clearCachedImportances(): void {
    this.cachedAverageImportance = undefined;
    this.cachedTransposedLocalFeatureImportances = undefined;
  }

  private filterRow(
    row: { [key: string]: number | string },
    filters: IFilter[]
  ): boolean {
    return filters
      .filter((item) => item)
      .every((filter) => {
        const rowVal = row[filter.column];
        switch (filter.method) {
          case FilterMethods.Equal:
            return rowVal === filter.arg[0];
          case FilterMethods.GreaterThan:
            return rowVal > filter.arg[0];
          case FilterMethods.GreaterThanEqualTo:
            return rowVal >= filter.arg[0];
          case FilterMethods.LessThan:
            return rowVal < filter.arg[0];
          case FilterMethods.LessThanEqualTo:
            return rowVal <= filter.arg[0];
          case FilterMethods.Includes:
            return (filter.arg as number[]).includes(Number(rowVal));
          case FilterMethods.Excludes:
            return !(filter.arg as number[]).includes(Number(rowVal));
          case FilterMethods.InTheRangeOf:
            return rowVal >= filter.arg[0] && rowVal <= filter.arg[1];
          default:
            return false;
        }
      });
  }

  private filterRecursively(
    row: { [key: string]: number },
    compositeFilter: ICompositeFilter
  ): boolean {
    if (compositeFilter.method) {
      return this.filterRow(row, [compositeFilter as IFilter]);
    }
    return this.filterComposite(
      row,
      compositeFilter.compositeFilters,
      compositeFilter.operation
    );
  }

  private filterComposite(
    row: { [key: string]: number },
    compositeFilters: ICompositeFilter[],
    operation: Operations
  ): boolean {
    if (operation === Operations.And) {
      return compositeFilters.every((compositeFilter) =>
        this.filterRecursively(row, compositeFilter)
      );
    }
    return compositeFilters.some((compositeFilter) =>
      this.filterRecursively(row, compositeFilter)
    );
  }

  private applyFilters(): Array<{ [key: string]: number }> {
    this.clearCachedImportances();
    let filteredData = this.jointDataset.dataDict;
    if (!filteredData) {
      return [];
    }
    const hasFilters = this.filters.length > 0;
    const hasCompositeFilters = this.compositeFilters.length > 0;
    if (hasFilters) {
      filteredData = filteredData.filter((row) =>
        this.filterRow(row, this.filters)
      );
    }
    if (hasCompositeFilters) {
      filteredData = filteredData.filter((row) =>
        this.filterComposite(row, this.compositeFilters, Operations.And)
      );
    }
    if (!hasFilters && !hasCompositeFilters) {
      filteredData = [...filteredData];
    }
    return filteredData;
  }
}

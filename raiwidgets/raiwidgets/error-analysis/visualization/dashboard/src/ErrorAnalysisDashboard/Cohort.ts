import { IFilter, FilterMethods } from "./Interfaces/IFilter";
import { JointDataset } from "./JointDataset";
import { ModelExplanationUtils } from "./ModelExplanationUtils";

export class Cohort {
    public static CohortKey: string = "Cohort";
    private static _cohortIndex: number = 0;

    public rowCount: number = 0;
    private readonly cohortIndex: number;
    private mutateCount: number = 0;
    private filteredData: Array<{[key: string]: number}>;
    private cachedAverageImportance: number[];
    private cachedTransposedLocalFeatureImportances: number[][];
    private currentSortKey: string | undefined;
    private currentSortReversed: boolean = false;
    constructor(public name: string, private jointDataset: JointDataset, public filters: IFilter[] = []) {
        this.cohortIndex = Cohort._cohortIndex;
        this.name = name;
        Cohort._cohortIndex += 1;
        this.applyFilters();
    }

    public updateFilter(filter: IFilter, index?: number): void {
        if (index === undefined) {
            index = this.filters.length;
        } 

        this.filters[index] = filter;
        this.applyFilters();
    }

    // An id to track if a change requiring rerender has occurred.
    public getCohortID(): number {
        return this.cohortIndex;
    }

    public deleteFilter(index: number): void {
        this.filters.splice(index, 1);
        this.applyFilters();
    }

    public getRow(index: number): {[key: string]: number} {
        return {...this.jointDataset.dataDict[index]}
    }

    public sort(columnName: string = JointDataset.IndexLabel, reverse?: boolean): void {
        if (this.currentSortKey !== columnName) {
            this.filteredData.sort((a, b) => {
                return a[columnName] - b[columnName];
            });
            this.currentSortKey = columnName;
            this.currentSortReversed = false;
        }
        if (this.currentSortReversed !== reverse) {
            this.filteredData.reverse();
        }
    }

    // whether to apply bins is a decision made at the ui control level,
    // should not mutate the true dataset. Instead, bin props are preserved
    // and applied when requested.
    // Bin object stores array of upper bounds for each bin, return the index
    // of the bin of the value;
    public unwrap(key: string, applyBin?: boolean): any[] {
        if (applyBin && this.jointDataset.metaDict[key].isCategorical === false) {
            let binVector = this.jointDataset.binDict[key];
            if (binVector === undefined) {
                this.jointDataset.addBin(key);
                binVector = this.jointDataset.binDict[key];
            }
            return this.filteredData.map(row => {
                const rowValue = row[key];
                return binVector.findIndex(upperLimit => upperLimit >= rowValue );
            });
        }
        return this.filteredData.map(row => row[key]);
    }

    public calculateAverageImportance(): number[] {
        if (this.cachedAverageImportance) {
            return this.cachedAverageImportance;
        }

        this.cachedAverageImportance = this.transposedLocalFeatureImportances().map(featureValues => {
            if (!featureValues || featureValues.length === 0) {
                return Number.NaN;
            }
            const total = featureValues.reduce((prev, current) => {return prev + Math.abs(current)}, 0);
            return total / featureValues.length;
        })
        return this.cachedAverageImportance;
    }

    public transposedLocalFeatureImportances(): number[][] {
        if (this.cachedTransposedLocalFeatureImportances) {
            return this.cachedTransposedLocalFeatureImportances;
        }
        const featureLength = this.jointDataset.localExplanationFeatureCount;
        const localFeatureImportances = this.filteredData.map(row => {
            return JointDataset.localExplanationSlice(row, featureLength);
        });
        this.cachedTransposedLocalFeatureImportances = ModelExplanationUtils.transpose2DArray(localFeatureImportances);
        return this.cachedTransposedLocalFeatureImportances;
    }

    private applyFilters(): void {
        this.cachedAverageImportance = undefined;
        this.cachedTransposedLocalFeatureImportances = undefined;
        this.mutateCount += 1;
        this.filteredData = this.jointDataset.dataDict.filter(row => 
            this.filters.every(filter => {
                const rowVal = row[filter.column];
                switch(filter.method){
                    case FilterMethods.equal:
                        return rowVal === filter.arg[0];
                    case FilterMethods.greaterThan:
                        return rowVal > filter.arg[0];
                    case FilterMethods.greaterThanEqualTo:
                        return rowVal >= filter.arg[0];
                    case FilterMethods.lessThan:
                        return rowVal < filter.arg[0];
                    case FilterMethods.lessThanEqualTo:
                        return rowVal <= filter.arg[0];
                    case FilterMethods.includes:
                        return (filter.arg as number[]).includes(rowVal);
                    case FilterMethods.inTheRangeOf:
                        return rowVal >= filter.arg[0] && rowVal <= filter.arg[1];
                }
            })
        );
        this.rowCount = this.filteredData.length;
    }
}
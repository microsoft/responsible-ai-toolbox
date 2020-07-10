// Define the interface for accessing data from a cohort data provider.
// Clients running without a service backend will have a local implementation

import { IFilter } from "./IFilter";

// A cohort defines a subset of a dataset, it is defined by a list of filters
// and a name and id. The filters could be applied to multiple datasets,
// allowing the generation of multiple cohorts meeting the same criteria.
export interface ICohort {
    // Unwrap provides all the vlaues in the cohort for a selected column.
    // If binned, return the index of the bin each column value fall into.
    // Whether to apply bins is a decision made at the ui control level,
    // should not mutate the true dataset. Instead, bin props are preserved
    // and applied when requested.
    // Bin object stores array of upper bounds for each bin, return the index
    // of the bin of the value;
    unwrap(key: string, applyBin?: boolean): any[];

    // replace filter at given index in the filter list with a new filter.
    // should clear cache and trigger rerun to fetch data. If index is the length
    // of the filter list, effectively just appends new filter to list.
    updateFilter(filter: IFilter, index: number): void;

    // deletes filter from list.
    deleteFilter(index: number): void;

    // return copy of the row specified by the index;
    getRow(index: number): { [key: string]: number };

    // Sort the subset of data by the values in the specified column.
    // Optional reverse parameter determines if ascending or decending.
    
    sort(columnName: string, reverse?: boolean): void;

    constructor()
}

export interface ICohort

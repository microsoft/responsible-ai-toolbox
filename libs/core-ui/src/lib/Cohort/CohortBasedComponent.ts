// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from "react";

import { IDataset } from "../Interfaces/IDataset";
import { IFilter, ICompositeFilter } from "../Interfaces/IFilter";
import { JointDataset } from "../util/JointDataset";

import { Cohort, CohortSource } from "./Cohort";
import { MetricCohortStats } from "./CohortStats";
import { ErrorCohort } from "./ErrorCohort";

export interface ICohortBasedComponentProps {
  dataset: IDataset;
}

export interface ICohortBasedComponentState {
  baseCohort: ErrorCohort;
  cohorts: ErrorCohort[];
  selectedCohort: ErrorCohort;
  jointDataset: JointDataset;
}

export abstract class CohortBasedComponent<
  TProps extends ICohortBasedComponentProps,
  TState extends ICohortBasedComponentState
> extends React.PureComponent<TProps, TState> {
  protected getSelectedCohort = (): ErrorCohort => {
    return this.state.selectedCohort;
  };
  protected updateSelectedCohort = (
    filters: IFilter[],
    compositeFilters: ICompositeFilter[],
    source: CohortSource = CohortSource.None,
    cells: number,
    cohortStats: MetricCohortStats | undefined
  ): void => {
    // Need to relabel the filter names based on index in joint dataset
    const filtersRelabeled = ErrorCohort.getDataFilters(
      filters,
      this.props.dataset.featureNames
    );

    let selectedCohortName = "";
    let addTemporaryCohort = true;
    if (source === CohortSource.TreeMap || source === CohortSource.HeatMap) {
      selectedCohortName = "Unsaved";
    } else {
      selectedCohortName = this.state.baseCohort.cohort.name;
      addTemporaryCohort = false;
    }
    const baseCohortFilters = this.state.baseCohort.cohort.filters;
    const baseCohortCompositeFilters = this.state.baseCohort.cohort
      .compositeFilters;
    const selectedCohort: ErrorCohort = new ErrorCohort(
      new Cohort(
        selectedCohortName,
        this.state.jointDataset,
        baseCohortFilters.concat(filtersRelabeled),
        baseCohortCompositeFilters.concat(compositeFilters)
      ),
      this.state.jointDataset,
      cells,
      source,
      addTemporaryCohort,
      cohortStats
    );
    let cohorts = this.state.cohorts.filter(
      (errorCohort) => !errorCohort.isTemporary
    );
    if (addTemporaryCohort) {
      cohorts = [selectedCohort, ...cohorts];
    }
    this.setState({ cohorts, selectedCohort });
  };
}

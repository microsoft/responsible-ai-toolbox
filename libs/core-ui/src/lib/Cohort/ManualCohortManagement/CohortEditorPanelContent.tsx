// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  TextField,
  Stack,
  Link,
  ChoiceGroup,
  IChoiceGroupOption
} from "@fluentui/react";
import { localization } from "@responsible-ai/localization";
import { IColumnRange, RangeTypes } from "@responsible-ai/mlchartlib";
import _ from "lodash";
import React, { FormEvent } from "react";

import { Announce } from "../../components/Announce";
import { DatasetCohortColumns } from "../../DatasetCohortColumns";
import { IDataset } from "../../Interfaces/IDataset";
import { IExplanationModelMetadata } from "../../Interfaces/IExplanationContext";
import {
  FilterMethods,
  ICompositeFilter,
  IFilter
} from "../../Interfaces/IFilter";
import { JointDataset } from "../../util/JointDataset";

import { cohortEditorStyles } from "./CohortEditor.styles";
import { CohortEditorFilterList } from "./CohortEditorFilterList";
import { CohortEditorFilterSection } from "./CohortEditorFilterSection";
import { getColumnItems } from "./CohortEditorPanelContentUtils";

export interface ICohortEditorPanelContentProps {
  columnRanges?: {
    [key: string]: IColumnRange;
  };
  dataset: IDataset;
  isFromExplanation: boolean;
  cohortName?: string;
  compositeFilters: ICompositeFilter[];
  disableEditName?: boolean;
  existingCohortNames?: string[];
  features?: unknown[][];
  metadata?: IExplanationModelMetadata;
  filters: IFilter[];
  isNewCohort: boolean;
  jointDataset: JointDataset;
  onCohortNameUpdated: (cohortName?: string) => void;
  onCompositeFiltersUpdated: (compositeFilters: ICompositeFilter[]) => void;
  onFiltersUpdated: (filters: IFilter[]) => void;
}

export interface ICohortEditorPanelContentState {
  filterIndex?: number;
  openedFilter?: IFilter;
  selectedFilterCategory?: string;
  filtersMessage?: string;
}

export class CohortEditorPanelContent extends React.PureComponent<
  ICohortEditorPanelContentProps,
  ICohortEditorPanelContentState
> {
  private readonly leftItems = getColumnItems(
    this.props.columnRanges,
    this.props.isFromExplanation
      ? this.props.features
      : this.props.dataset.features
  );
  private _isInitialized = false;

  public constructor(props: ICohortEditorPanelContentProps) {
    super(props);
    this.state = {
      filterIndex: this.props.filters?.length || 0,
      filtersMessage: "",
      openedFilter: this.getFilterValue(
        this.leftItems[0] && this.leftItems[0].key
      ),
      selectedFilterCategory: this.leftItems[0] && this.leftItems[0].key
    };
    this._isInitialized = true;
  }

  public render(): React.ReactNode {
    const styles = cohortEditorStyles();
    return (
      <Stack tokens={{ childrenGap: "l1" }}>
        <Stack.Item>
          <TextField
            value={this.props.cohortName}
            label={localization.Interpret.CohortEditor.cohortNameLabel}
            placeholder={
              localization.Interpret.CohortEditor.cohortNamePlaceholder
            }
            onGetErrorMessage={this.getErrorMessage}
            disabled={this.props.disableEditName}
            onChange={this.setCohortName}
          />
        </Stack.Item>
        <Stack.Item>
          <ChoiceGroup
            options={this.leftItems}
            label={localization.Interpret.CohortEditor.selectFilter}
            onChange={this.onFilterCategoryChange}
            selectedKey={this.state.selectedFilterCategory}
          />
        </Stack.Item>
        <CohortEditorFilterSection
          {...this.props}
          filterIndex={this.state.filterIndex}
          openedFilter={this.state.openedFilter}
          onOpenedFilterUpdated={this.onOpenedFilterUpdated}
          onSelectedFilterCategoryUpdated={this.onSelectedFilterCategoryUpdated}
          setFilterMessage={this.setFilterMessage}
          setDefaultStateForKey={this.setDefaultStateForKey}
        />
        <Stack.Item>
          <CohortEditorFilterList
            compositeFilters={this.props.compositeFilters}
            editFilter={this.editFilter}
            removeCompositeFilter={this.removeCompositeFilter}
            removeFilter={this.removeFilter}
            filters={this.props.filters}
            jointDataset={this.props.jointDataset}
          />
        </Stack.Item>
        <Stack.Item>
          <Link className={styles.clearFilter} onClick={this.clearAllFilters}>
            {localization.Interpret.CohortEditor.clearAllFilters}
          </Link>
          <Announce message={this.state.filtersMessage} />
        </Stack.Item>
      </Stack>
    );
  }

  private isDuplicate = (): boolean => {
    return !!(
      this.props.isNewCohort &&
      this.props.cohortName &&
      this.props.existingCohortNames?.includes(this.props.cohortName)
    );
  };

  private clearAllFilters = (): void => {
    this.props.onCompositeFiltersUpdated([]);
    this.props.onFiltersUpdated([]);
    this.setState({ filterIndex: 0 });
    this.setFilterMessage(localization.Interpret.CohortEditor.noFiltersApplied);
  };

  private setFilterMessage = (filtersMessage?: string): void => {
    this.setState({
      filtersMessage
    });
  };

  private getErrorMessage = (): string | undefined => {
    if (!this.props.cohortName?.length) {
      return localization.Interpret.CohortEditor.cohortNameError;
    }
    if (this.isDuplicate()) {
      return localization.Interpret.CohortEditor.cohortNameDupError;
    }
    return undefined;
  };
  private readonly onFilterCategoryChange = (
    _?: FormEvent<HTMLElement | HTMLInputElement> | undefined,
    option?: IChoiceGroupOption | undefined
  ): void => {
    if (typeof option?.key === "string") {
      this.setState({
        filterIndex: this.props.filters.length,
        selectedFilterCategory: option.key
      });
      this.setSelection(option.key);
    }
  };

  private onSelectedFilterCategoryUpdated = (
    selectedFilterCategory?: string
  ): void => {
    this.setState({ selectedFilterCategory });
  };

  private readonly setSelection = (property: string): void => {
    if (!this._isInitialized) {
      return;
    }
    if (property === DatasetCohortColumns.Dataset) {
      property = this.props.isFromExplanation
        ? this.props.metadata?.featureNames[0] || ""
        : this.props.dataset.feature_names[0];
    }
    this.setDefaultStateForKey(property);
  };

  private setDefaultStateForKey = (key: string): void => {
    const filter = this.getFilterValue(key);
    this.setState({
      openedFilter: filter
    });
  };

  private getFilterValue(key: string): IFilter {
    const filter: IFilter = { column: key } as IFilter;
    const range = this.props.columnRanges
      ? this.props.columnRanges[key]
      : undefined;
    const arg = this.getPreviousFilterArgValue(key);
    if (
      range?.rangeType === RangeTypes.Categorical ||
      range?.treatAsCategorical
    ) {
      filter.method = FilterMethods.Includes;
      filter.arg = arg ?? [
        ...new Array(range.sortedUniqueValues.length).keys()
      ];
    } else {
      filter.method = FilterMethods.LessThan;
      filter.arg = arg ?? [range?.max || Number.MAX_SAFE_INTEGER];
    }
    return filter;
  }

  private getPreviousFilterArgValue(key: string): number[] | undefined {
    let arg;
    // only execute this if in edit mode
    this.props.disableEditName &&
      this.props.filters?.forEach((filter) => {
        if (filter.column === key) {
          arg = filter.arg;
        }
      });
    return arg;
  }

  private removeFilter = (index: number): void => {
    const filters = [...this.props.filters];
    filters.splice(index, 1);
    this.props.onFiltersUpdated(filters);
    this.setState({ filterIndex: filters.length });
  };

  private removeCompositeFilter = (index: number): void => {
    const compositeFilters = [...this.props.compositeFilters];
    compositeFilters.splice(index, 1);
    this.props.onCompositeFiltersUpdated(compositeFilters);
  };

  private editFilter = (index: number): void => {
    const editFilter = this.props.filters[index];
    this.setState({
      filterIndex: index,
      openedFilter: _.cloneDeep(editFilter)
    });
  };

  private onOpenedFilterUpdated = (openedFilter?: IFilter): void => {
    this.setState({ openedFilter });
  };

  private setCohortName = (
    _event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>,
    newValue?: string
  ): void => {
    this.props.onCohortNameUpdated(newValue);
  };
}

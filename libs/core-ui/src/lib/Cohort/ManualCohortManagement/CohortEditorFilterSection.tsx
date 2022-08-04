// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IComboBoxOption, IComboBox, Text, Stack } from "@fluentui/react";
import { localization } from "@responsible-ai/localization";
import { RangeTypes } from "@responsible-ai/mlchartlib";
import _ from "lodash";
import React from "react";

import { FilterMethods, IFilter } from "../../Interfaces/IFilter";
import { JointDataset } from "../../util/JointDataset";
import { IJointMeta } from "../../util/JointDatasetUtils";

import { CohortEditorFilter } from "./CohortEditorFilter";

export interface ICohortEditorFilterSectionProps {
  filterIndex?: number;
  filters: IFilter[];
  jointDataset: JointDataset;
  openedFilter?: IFilter;
  onFiltersUpdated: (filters: IFilter[]) => void;
  onOpenedFilterUpdated: (openedFilter?: IFilter) => void;
  onSelectedFilterCategoryUpdated: (selectedFilterCategory?: string) => void;
}

export interface ICohortEditorFilterSectionState {
  showInvalidMinMaxValueError: boolean;
  showInvalidValueError: boolean;
}

export class CohortEditorFilterSection extends React.PureComponent<
  ICohortEditorFilterSectionProps,
  ICohortEditorFilterSectionState
> {
  public constructor(props: ICohortEditorFilterSectionProps) {
    super(props);
    this.state = {
      showInvalidMinMaxValueError: false,
      showInvalidValueError: false
    };
  }

  public render(): React.ReactNode {
    return (
      <Stack.Item>
        {!this.props.openedFilter ? (
          <Text variant={"medium"}>
            {localization.Interpret.CohortEditor.defaultFilterState}
          </Text>
        ) : (
          <CohortEditorFilter
            cancelFilter={this.cancelFilter}
            filters={this.props.filters}
            jointDataset={this.props.jointDataset}
            openedFilter={this.props.openedFilter}
            saveState={this.saveState}
            setAsCategorical={this.setAsCategorical}
            setCategoricalValues={this.setCategoricalValues}
            setComparison={this.setComparison}
            setNumericValue={this.setNumericValue}
            setSelectedProperty={this.setSelectedProperty}
            showInvalidValueError={this.state.showInvalidValueError}
            showInvalidMinMaxValueError={this.state.showInvalidMinMaxValueError}
            filterIndex={this.props.filterIndex}
          />
        )}
      </Stack.Item>
    );
  }

  private readonly setAsCategorical = (
    _ev?: React.FormEvent,
    checked?: boolean
  ): void => {
    if (checked === undefined || !this.props.openedFilter) {
      return;
    }
    const openedFilter = this.props.openedFilter;
    this.props.jointDataset.setTreatAsCategorical(openedFilter.column, checked);
    if (checked) {
      this.props.onOpenedFilterUpdated({
        arg: [],
        column: openedFilter.column,
        method: FilterMethods.Includes
      });
    } else {
      this.props.onOpenedFilterUpdated({
        arg: [
          this.props.jointDataset.metaDict[openedFilter.column].featureRange
            ?.max || Number.MAX_SAFE_INTEGER
        ],
        column: openedFilter.column,
        method: FilterMethods.LessThan
      });
    }
  };

  private readonly setSelectedProperty = (
    _: React.FormEvent<IComboBox>,
    item?: IComboBoxOption
  ): void => {
    if (typeof item?.key === "string") {
      const property = item.key;
      this.setDefaultStateForKey(property);
    }
  };

  private saveState = (index?: number): void => {
    if (!this.props.openedFilter || index === undefined) {
      return;
    }
    this.updateFilter(this.props.openedFilter, index);
    this.props.onSelectedFilterCategoryUpdated(undefined);
  };

  private readonly setCategoricalValues = (
    _ev?: React.FormEvent<IComboBox>,
    item?: IComboBoxOption
  ): void => {
    if (!this.props.openedFilter || (!item?.key && item?.key !== 0)) {
      return;
    }
    const selectedVals = [...(this.props.openedFilter.arg as number[])];

    const index = selectedVals.indexOf(item.key as number);
    if (item.selected && index === -1) {
      selectedVals.push(item.key as number);
    } else {
      selectedVals.splice(index, 1);
    }
    this.props.onOpenedFilterUpdated({
      arg: selectedVals,
      column: this.props.openedFilter.column,
      method: this.props.openedFilter.method
    });
  };

  private readonly setComparison = (
    _ev?: React.FormEvent<IComboBox>,
    item?: IComboBoxOption
  ): void => {
    if (!this.props.openedFilter || !item) {
      return;
    }
    const openedFilter = this.props.openedFilter;
    if ((item.key as FilterMethods) === FilterMethods.InTheRangeOf) {
      //default values for in the range operation
      const meta =
        this.props.jointDataset.metaDict[openedFilter.column].featureRange;
      if (meta?.min === undefined) {
        openedFilter.arg[0] = Number.MIN_SAFE_INTEGER;
      } else {
        openedFilter.arg[0] = meta.min;
      }
      if (meta?.max === undefined) {
        openedFilter.arg[1] = Number.MAX_SAFE_INTEGER;
      } else {
        openedFilter.arg[1] = meta.max;
      }
    } else {
      //handle switch from in the range to less than, equals etc
      openedFilter.arg = openedFilter.arg.slice(0, 1);
    }
    this.props.onOpenedFilterUpdated({
      arg: openedFilter.arg,
      column: openedFilter.column,
      method: item.key as FilterMethods
    });
  };

  private readonly setNumericValue = (
    delta: number,
    column: IJointMeta,
    index: number,
    stringVal: string
  ): string | void => {
    if (!this.props.openedFilter) {
      return;
    }
    const openArg = this.props.openedFilter.arg;
    const max = column.featureRange?.max || Number.MAX_SAFE_INTEGER;
    const min = column.featureRange?.min || Number.MIN_SAFE_INTEGER;
    if (delta === 0) {
      const numberVal = +stringVal;
      if (
        (!Number.isInteger(numberVal) &&
          column.featureRange?.rangeType === RangeTypes.Integer) ||
        numberVal > max ||
        numberVal < min
      ) {
        this.setState({
          showInvalidMinMaxValueError: false,
          showInvalidValueError: true
        });
        return this.props.openedFilter.arg[index].toString();
      }
      this.setState({ showInvalidValueError: false });
      openArg[index] = numberVal;
    } else {
      const prevVal = openArg[index];
      const newVal = prevVal + delta;
      if (newVal > max || newVal < min) {
        this.setState({
          showInvalidMinMaxValueError: false,
          showInvalidValueError: true
        });
        return prevVal.toString();
      }
      this.setState({ showInvalidValueError: false });
      openArg[index] = newVal;
    }

    // in the range validation
    if (openArg[1] <= openArg[0]) {
      openArg[1] = max;
      this.setState({
        showInvalidMinMaxValueError: true,
        showInvalidValueError: false
      });
    } else {
      this.setState({ showInvalidMinMaxValueError: false });
    }

    this.props.onOpenedFilterUpdated({
      arg: openArg,
      column: this.props.openedFilter.column,
      method: this.props.openedFilter.method
    });
  };

  private setDefaultStateForKey(key: string): void {
    const filter = this.getFilterValue(key);
    this.props.onOpenedFilterUpdated(filter);
  }

  private getFilterValue(key: string): IFilter {
    const filter: IFilter = { column: key } as IFilter;
    const meta = this.props.jointDataset.metaDict[key];
    if (meta?.treatAsCategorical && meta.sortedCategoricalValues) {
      filter.method = FilterMethods.Includes;
      filter.arg = [...new Array(meta.sortedCategoricalValues.length).keys()];
    } else {
      filter.method = FilterMethods.LessThan;
      filter.arg = [meta.featureRange?.max || Number.MAX_SAFE_INTEGER];
    }
    return filter;
  }

  private updateFilter(filter: IFilter, index: number): void {
    const filters = [...this.props.filters];
    filters[index] = filter;
    this.props.onOpenedFilterUpdated(undefined);
    this.props.onFiltersUpdated(filters);
  }

  private cancelFilter = (): void => {
    this.props.onSelectedFilterCategoryUpdated(undefined);
    this.props.onOpenedFilterUpdated(undefined);
  };
}

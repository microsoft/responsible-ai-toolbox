// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IComboBoxOption, IComboBox, Text, Stack } from "@fluentui/react";
import { localization } from "@responsible-ai/localization";
import { IColumnRange, RangeTypes } from "@responsible-ai/mlchartlib";
import React from "react";

import {
  defaultModelAssessmentContext,
  ModelAssessmentContext
} from "../../Context/ModelAssessmentContext";
import { IExplanationModelMetadata } from "../../Interfaces/IExplanationContext";
import { FilterMethods, IFilter } from "../../Interfaces/IFilter";
import { JointDataset } from "../../util/JointDataset";

import { CohortEditorFilter } from "./CohortEditorFilter";
import { translateToLegacyFilterColumn } from "./CohortEditorUtils";

export interface ICohortEditorFilterSectionProps {
  isFromExplanation: boolean;
  metadata?: IExplanationModelMetadata;
  filterIndex?: number;
  filters: IFilter[];
  jointDataset: JointDataset;
  openedFilter?: IFilter;
  onFiltersUpdated: (filters: IFilter[]) => void;
  onOpenedFilterUpdated: (openedFilter?: IFilter) => void;
  onSelectedFilterCategoryUpdated: (selectedFilterCategory?: string) => void;
  setFilterMessage: (filtersMessage: string) => void;
  setDefaultStateForKey: (key: string) => void;
}

export interface ICohortEditorFilterSectionState {
  showInvalidMinMaxValueError: boolean;
  showInvalidValueError: boolean;
}

export class CohortEditorFilterSection extends React.PureComponent<
  ICohortEditorFilterSectionProps,
  ICohortEditorFilterSectionState
> {
  public static contextType = ModelAssessmentContext;
  public context: React.ContextType<typeof ModelAssessmentContext> =
    defaultModelAssessmentContext;
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
            featureNames={
              this.props.isFromExplanation
                ? this.props.metadata?.featureNames || []
                : this.context.dataset.feature_names
            }
            columnRanges={this.context.columnRanges}
            cancelFilter={this.cancelFilter}
            filters={this.props.filters}
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
            setFilterMessage={this.props.setFilterMessage}
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
    const legacyColumn = translateToLegacyFilterColumn(
      openedFilter.column,
      this.context.dataset.feature_names
    );
    this.props.jointDataset.setTreatAsCategorical(legacyColumn, checked);
    if (this.context.setAsCategorical) {
      this.context.setAsCategorical(openedFilter.column, checked);
    }
    if (checked) {
      this.props.onOpenedFilterUpdated({
        arg: [],
        column: openedFilter.column,
        method: FilterMethods.Includes
      });
    } else {
      const args = (
        this.context.columnRanges &&
        this.context.columnRanges[openedFilter.column]
      )?.max;
      this.props.onOpenedFilterUpdated({
        arg: [args || Number.MAX_SAFE_INTEGER],
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
      this.props.setDefaultStateForKey(property);
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
      const range =
        this.context.columnRanges &&
        this.context.columnRanges[this.props.openedFilter.column];
      if (range?.min === undefined) {
        openedFilter.arg[0] = Number.MIN_SAFE_INTEGER;
      } else {
        openedFilter.arg[0] = range.min;
      }
      if (range?.max === undefined) {
        openedFilter.arg[1] = Number.MAX_SAFE_INTEGER;
      } else {
        openedFilter.arg[1] = range.max;
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
    index: number,
    stringVal: string,
    range?: IColumnRange
  ): string | void => {
    if (!this.props.openedFilter) {
      return;
    }
    const openArg = this.props.openedFilter.arg;
    const max = range?.max || Number.MAX_SAFE_INTEGER;
    const min = range?.min || Number.MIN_SAFE_INTEGER;
    if (delta === 0) {
      const numberVal = +stringVal;
      if (
        (!Number.isInteger(numberVal) &&
          range?.rangeType === RangeTypes.Integer) ||
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

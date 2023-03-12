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
import {
  ICategoricalRange,
  INumericRange,
  RangeTypes
} from "@responsible-ai/mlchartlib";
import _ from "lodash";
import React, { FormEvent } from "react";

import { Announce } from "../../components/Announce";
import {
  defaultModelAssessmentContext,
  ModelAssessmentContext
} from "../../Context/ModelAssessmentContext";
import { ModelTypes } from "../../Interfaces/IExplanationContext";
import {
  FilterMethods,
  ICompositeFilter,
  IFilter
} from "../../Interfaces/IFilter";
import { JointDataset } from "../../util/JointDataset";

import { cohortEditorStyles } from "./CohortEditor.styles";
import { CohortEditorFilterList } from "./CohortEditorFilterList";
import { CohortEditorFilterSection } from "./CohortEditorFilterSection";
import {
  legacyFilterArgRetainableList,
  filterArgRetainableList,
  getLegacyChoices,
  getChoices
} from "./CohortEditorPanelContentUtils";

export interface ICohortEditorPanelContentProps {
  isRefactorFlightOn?: boolean;
  columnRanges?: {
    [key: string]: INumericRange | ICategoricalRange;
  };
  modelType?: ModelTypes;
  cohortName?: string;
  compositeFilters: ICompositeFilter[];
  disableEditName?: boolean;
  existingCohortNames?: string[];
  filterList?: IFilter[];
  legacyFilters: IFilter[];
  filters: IFilter[];
  isNewCohort: boolean;
  jointDataset: JointDataset;
  onCohortNameUpdated: (cohortName?: string) => void;
  onCompositeFiltersUpdated: (compositeFilters: ICompositeFilter[]) => void;
  onFiltersUpdated: (filters: IFilter[], isLegacy: boolean) => void;
}

export interface ICohortEditorPanelContentState {
  filterIndex?: number;
  openedLegacyFilter?: IFilter;
  openedFilter?: IFilter;
  selectedFilterCategory?: string;
  filtersMessage?: string;
}

export class CohortEditorPanelContent extends React.PureComponent<
  ICohortEditorPanelContentProps,
  ICohortEditorPanelContentState
> {
  public static contextType = ModelAssessmentContext;
  public context: React.ContextType<typeof ModelAssessmentContext> =
    defaultModelAssessmentContext;
  private readonly choices = getChoices(this.props.columnRanges);
  private readonly legacyChoices = getLegacyChoices(this.props.jointDataset);
  private readonly leftItems: IChoiceGroupOption[] = this.props
    .isRefactorFlightOn
    ? this.choices
    : this.legacyChoices;
  private _isInitialized = false;

  public constructor(props: ICohortEditorPanelContentProps) {
    super(props);
    this.state = {
      filterIndex: this.props.filterList?.length || 0,
      filtersMessage: "",
      openedFilter: this.getFilterValue(
        this.leftItems[0] && this.leftItems[0].key
      ),
      openedLegacyFilter: this.getLegacyFilterValue(
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
          openedLegacyFilter={this.state.openedLegacyFilter}
          openedFilter={this.state.openedFilter}
          onOpenedFilterUpdated={this.onOpenedFilterUpdated}
          onSelectedFilterCategoryUpdated={this.onSelectedFilterCategoryUpdated}
          setFilterMessage={this.setFilterMessage}
        />
        <Stack.Item>
          <CohortEditorFilterList
            columnRanges={this.props.columnRanges}
            isRefactorFlightOn={this.props.isRefactorFlightOn || false}
            compositeFilters={this.props.compositeFilters}
            editFilter={this.editFilter}
            removeCompositeFilter={this.removeCompositeFilter}
            removeFilter={this.removeFilter}
            legacyFilters={this.props.legacyFilters}
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
    this.props.onFiltersUpdated([], true);
    this.props.onFiltersUpdated([], false);
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
      const filters = this.props.isRefactorFlightOn
        ? this.props.filters
        : this.props.legacyFilters;
      this.setState({
        filterIndex: filters.length,
        selectedFilterCategory: option.key
      });
      this.setSelection(option);
    }
  };

  private onSelectedFilterCategoryUpdated = (
    selectedFilterCategory?: string
  ): void => {
    this.setState({ selectedFilterCategory });
  };

  private readonly setSelection = (option: IChoiceGroupOption): void => {
    if (!this._isInitialized) {
      return;
    }
    const id = option.id;
    let column = this.choices[Number(id)].key;
    let legacyColumn = this.legacyChoices[Number(id)].key;
    if (id === "1") {
      column = this.context.dataset.feature_names[0];
      legacyColumn = `${this.legacyChoices[1].key}0`;
    }
    const filter = this.getFilterValue(column);
    const legacyFilter = this.getLegacyFilterValue(legacyColumn);
    this.setState({ openedFilter: filter, openedLegacyFilter: legacyFilter });
  };

  private getLegacyFilterValue(key: string): IFilter {
    const filter: IFilter = { column: key } as IFilter;
    const meta = this.props.jointDataset.metaDict[key];
    if (meta?.treatAsCategorical && meta.sortedCategoricalValues) {
      const arg = this.getPreviousFilterArgValue(key, true);
      filter.method = FilterMethods.Includes;
      filter.arg = arg ?? [
        ...new Array(meta.sortedCategoricalValues.length).keys()
      ];
    } else {
      filter.method = FilterMethods.LessThan;
      filter.arg = [meta.featureRange?.max || Number.MAX_SAFE_INTEGER];
    }
    return filter;
  }
  private getFilterValue(key: string): IFilter {
    const filter: IFilter = { column: key } as IFilter;
    const range = this.props.columnRanges
      ? this.props.columnRanges[key]
      : ({} as INumericRange);
    if (range?.rangeType === RangeTypes.Categorical) {
      const arg = this.getPreviousFilterArgValue(key);
      filter.method = FilterMethods.Includes;
      filter.arg = arg ?? [...new Array(range.uniqueValues.length).keys()];
    } else {
      filter.method = FilterMethods.LessThan;
      filter.arg = [range?.max || Number.MAX_SAFE_INTEGER];
    }
    return filter;
  }

  private getPreviousFilterArgValue(
    key: string,
    isLegacy?: boolean
  ): number[] | undefined {
    let arg;
    // only execute this if in edit mode
    // On duplication retained arg is shown only for filters in filterArgRetainableList
    this.props.disableEditName &&
      (isLegacy
        ? legacyFilterArgRetainableList
        : filterArgRetainableList
      ).includes(key) &&
      this.props.filterList?.forEach((filter) => {
        if (filter.column === key) {
          arg = filter.arg;
        }
      });
    return arg;
  }

  private removeFilter = (index: number): void => {
    const legacyFilters = [...this.props.legacyFilters];
    legacyFilters.splice(index, 1);
    this.props.onFiltersUpdated(legacyFilters, true);
    const filters = [...this.props.filters];
    filters.splice(index, 1);
    this.props.onFiltersUpdated(filters, false);
  };

  private removeCompositeFilter = (index: number): void => {
    const compositeFilters = [...this.props.compositeFilters];
    compositeFilters.splice(index, 1);
    this.props.onCompositeFiltersUpdated(compositeFilters);
  };

  private editFilter = (index: number): void => {
    this.setState({
      filterIndex: index,
      openedFilter: _.cloneDeep(this.props.filters[index]),
      openedLegacyFilter: _.cloneDeep(this.props.legacyFilters[index])
    });
  };

  private onOpenedFilterUpdated = (
    isLegacy: boolean,
    openedFilter?: IFilter
  ): void => {
    isLegacy
      ? this.setState({ openedLegacyFilter: openedFilter })
      : this.setState({ openedFilter });
  };

  private setCohortName = (
    _event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>,
    newValue?: string
  ): void => {
    this.props.onCohortNameUpdated(newValue);
  };
}

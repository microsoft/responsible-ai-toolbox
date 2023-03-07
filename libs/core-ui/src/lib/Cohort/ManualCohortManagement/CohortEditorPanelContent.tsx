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
import { DatasetCohort } from "../../DatasetCohort";
import { isFlightActive, RefactorFlight } from "../../FeatureFlights";
import { IDataset } from "../../Interfaces/IDataset";
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
  filterArgRetainableList,
  filterArgRetainableList2,
  getChoices,
  getChoices2
} from "./CohortEditorPanelContentUtils";

export interface ICohortEditorPanelContentProps {
  activeFlights?: string[];
  dataset: IDataset;
  datasetFeatureRanges?: {
    [key: string]: INumericRange | ICategoricalRange;
  };
  modelType?: ModelTypes;
  cohortName?: string;
  compositeFilters: ICompositeFilter[];
  disableEditName?: boolean;
  existingCohortNames?: string[];
  filterList?: IFilter[];
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
  private isRefactorFlightOn = isFlightActive(
    RefactorFlight,
    this.props.activeFlights
  );
  private readonly leftItems: IChoiceGroupOption[] = this.isRefactorFlightOn
    ? getChoices2(this.props.datasetFeatureRanges)
    : getChoices(this.props.jointDataset);
  private _isInitialized = false;

  public constructor(props: ICohortEditorPanelContentProps) {
    super(props);
    this.state = {
      filterIndex: this.props.filterList?.length || 0,
      filtersMessage: "",
      openedFilter: this.isRefactorFlightOn
        ? this.getFilterValue2(this.leftItems[0] && this.leftItems[0].key)
        : this.getFilterValue(this.leftItems[0] && this.leftItems[0].key),
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
          isRemoveJointDatasetFlightOn={this.isRefactorFlightOn}
          onOpenedFilterUpdated={this.onOpenedFilterUpdated}
          onSelectedFilterCategoryUpdated={this.onSelectedFilterCategoryUpdated}
          setFilterMessage={this.setFilterMessage}
          datasetFeatureRanges={this.props.datasetFeatureRanges}
        />
        <Stack.Item>
          <CohortEditorFilterList
            datasetFeatureRanges={this.props.datasetFeatureRanges}
            isRemoveJointDatasetFlightOn={this.isRefactorFlightOn}
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
    if (this.isRefactorFlightOn) {
      if (property === DatasetCohort.Dataset) {
        this.setDefaultStateForKey(this.props.dataset.feature_names[0]);
        return;
      }
    } else if (property === JointDataset.DataLabelRoot) {
      property += "0";
    }
    this.setDefaultStateForKey(property);
  };

  private setDefaultStateForKey(key: string): void {
    const filter = this.isRefactorFlightOn
      ? this.getFilterValue2(key)
      : this.getFilterValue(key);
    this.setState({
      openedFilter: filter
    });
  }

  private getFilterValue(key: string): IFilter {
    const filter: IFilter = { column: key } as IFilter;
    const meta = this.props.jointDataset.metaDict[key];
    if (meta?.treatAsCategorical && meta.sortedCategoricalValues) {
      const arg = this.getPreviousFilterArgValue(key);
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
  private getFilterValue2(key: string): IFilter {
    const filter: IFilter = { column: key } as IFilter;
    const range = this.props.datasetFeatureRanges
      ? this.props.datasetFeatureRanges[key]
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

  private getPreviousFilterArgValue(key: string): number[] | undefined {
    let arg;
    // only execute this if in edit mode
    // On duplication retained arg is shown only for filters in filterArgRetainableList
    this.props.disableEditName &&
      (this.isRefactorFlightOn
        ? filterArgRetainableList2
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
    const filters = [...this.props.filters];
    filters.splice(index, 1);
    this.props.onFiltersUpdated(filters);
  };

  private removeCompositeFilter = (index: number): void => {
    const compositeFilters = [...this.props.compositeFilters];
    compositeFilters.splice(index, 1);
    this.props.onCompositeFiltersUpdated(compositeFilters);
  };

  private editFilter = (index: number): void => {
    this.setState({
      filterIndex: index,
      openedFilter: _.cloneDeep(this.props.filters[index])
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

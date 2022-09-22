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
import _ from "lodash";
import React, { FormEvent } from "react";

import { Announce } from "../../components/Announce";
import {
  FilterMethods,
  ICompositeFilter,
  IFilter
} from "../../Interfaces/IFilter";
import { JointDataset } from "../../util/JointDataset";

import { cohortEditorStyles } from "./CohortEditor.styles";
import { CohortEditorFilterList } from "./CohortEditorFilterList";
import { CohortEditorFilterSection } from "./CohortEditorFilterSection";

export interface ICohortEditorPanelContentProps {
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
  private readonly leftItems: IChoiceGroupOption[] = [
    JointDataset.IndexLabel,
    JointDataset.DataLabelRoot,
    JointDataset.PredictedYLabel,
    JointDataset.TrueYLabel,
    JointDataset.ClassificationError,
    JointDataset.RegressionError
  ].reduce((previousValue: IChoiceGroupOption[], key: string) => {
    const metaVal = this.props.jointDataset.metaDict[key];
    if (
      key === JointDataset.DataLabelRoot &&
      this.props.jointDataset.hasDataset
    ) {
      previousValue.push({ key, text: "Dataset" });
      return previousValue;
    }
    if (metaVal === undefined) {
      return previousValue;
    }
    previousValue.push({ key, text: metaVal.abbridgedLabel });
    return previousValue;
  }, []);
  private _isInitialized = false;

  public constructor(props: ICohortEditorPanelContentProps) {
    super(props);
    this.state = {
      filterIndex: this.props.filterList?.length || 0,
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
    if (property === JointDataset.DataLabelRoot) {
      property += "0";
    }
    this.setDefaultStateForKey(property);
  };

  private setDefaultStateForKey(key: string): void {
    const filter = this.getFilterValue(key);
    this.setState({
      openedFilter: filter
    });
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

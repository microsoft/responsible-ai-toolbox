// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IDropdownOption,
  PrimaryButton,
  DefaultButton,
  ContextualMenu,
  Dialog,
  DialogType,
  DialogFooter,
  Dropdown
} from "@fluentui/react";
import {
  CohortEditorFilterList,
  DatasetTaskType,
  defaultModelAssessmentContext,
  ErrorCohort,
  ModelAssessmentContext,
  translateToNewFilters
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import React from "react";

export interface IShiftCohortProps {
  onDismiss: () => void;
  onApply: (selectedCohort: ErrorCohort) => void;
  defaultCohort?: ErrorCohort;
  showAllDataCohort: boolean;
}

export interface IShiftCohortState {
  options: IDropdownOption[];
  selectedCohort: number;
  savedCohorts: ErrorCohort[];
}

export class ShiftCohort extends React.Component<
  IShiftCohortProps,
  IShiftCohortState
> {
  public static contextType = ModelAssessmentContext;
  public context: React.ContextType<typeof ModelAssessmentContext> =
    defaultModelAssessmentContext;

  public componentDidMount(): void {
    const savedCohorts = this.context.errorCohorts.filter(
      (errorCohort) =>
        !errorCohort.isTemporary &&
        (this.props.showAllDataCohort || !errorCohort.isAllDataCohort)
    );
    const options: IDropdownOption[] = savedCohorts.map(
      (savedCohort: ErrorCohort, index: number) => {
        return { key: index, text: savedCohort.cohort.name };
      }
    );
    let defaultCohort = 0;
    if (this.props.defaultCohort) {
      const defaultCohortName = this.props.defaultCohort.cohort.name;
      const index = savedCohorts.findIndex((errorCohort) => {
        return errorCohort.cohort.name === defaultCohortName;
      });
      if (index !== -1) {
        defaultCohort = index;
      }
    }
    this.setState({
      options,
      savedCohorts,
      selectedCohort: defaultCohort
    });
  }

  public render(): React.ReactNode {
    if (!this.state) {
      return React.Fragment;
    }
    const legacyFilters =
      this.state.savedCohorts[this.state.selectedCohort].cohort.filters;
    const filters = translateToNewFilters(
      legacyFilters,
      this.context.dataset.feature_names
    );
    let localizationBase;
    if (
      this.context &&
      this.context.dataset.task_type === DatasetTaskType.Forecasting
    ) {
      localizationBase = localization.Forecasting.TimeSeries;
    } else {
      localizationBase = localization.ModelAssessment.Cohort;
    }
    return (
      <Dialog
        hidden={false}
        onDismiss={this.props.onDismiss}
        dialogContentProps={{
          subText: localizationBase.shiftCohortDescription,
          title: localizationBase.shiftCohort,
          type: DialogType.close
        }}
        modalProps={{
          dragOptions: {
            closeMenuItemText: "Close",
            menu: ContextualMenu,
            moveMenuItemText: "Move"
          },
          isBlocking: true
        }}
        minWidth={740}
        maxWidth={1000}
      >
        <Dropdown
          placeholder={localizationBase.selectCohort}
          label={localizationBase.cohortList}
          selectedKey={this.state.selectedCohort}
          options={this.state.options}
          onChange={this.onChange}
        />
        <CohortEditorFilterList
          compositeFilters={
            this.state.savedCohorts[this.state.selectedCohort].cohort
              .compositeFilters
          }
          filters={filters}
          jointDataset={this.context.jointDataset}
        />
        <DialogFooter>
          <PrimaryButton
            onClick={this.shiftCohort}
            text={localizationBase.apply}
          />
          <DefaultButton
            onClick={this.props.onDismiss}
            text={localizationBase.cancel}
          />
        </DialogFooter>
      </Dialog>
    );
  }

  private onChange = (
    _: React.FormEvent<HTMLDivElement>,
    item?: IDropdownOption
  ): void => {
    if (item) {
      this.setState({ selectedCohort: item.key as number });
    }
  };

  private shiftCohort = (): void => {
    this.props.onApply(this.state.savedCohorts[this.state.selectedCohort]);
  };
}

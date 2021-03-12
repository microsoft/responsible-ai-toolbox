// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IDropdownStyles,
  IDropdownOption,
  PrimaryButton,
  DefaultButton,
  ContextualMenu,
  Dialog,
  DialogType,
  DialogFooter,
  Dropdown
} from "office-ui-fabric-react";
import React from "react";

import { ErrorCohort } from "../ErrorCohort";
import { CohortStats } from "../CohortStats/CohortStats";

export interface IShiftCohortProps {
  isOpen: boolean;
  cohorts: ErrorCohort[];
  onDismiss: () => void;
  onApply: (selectedCohort: ErrorCohort) => void;
}

export interface IShiftCohortState {
  options: IDropdownOption[];
  selectedCohort: number;
}

const dialogContentProps = {
  subText:
    "Select a cohort from the cohort list. Apply the cohort to the dashboard.",
  title: "Shift Cohort",
  type: DialogType.close
};

const dropdownStyles: Partial<IDropdownStyles> = {
  dropdown: { width: 200 }
};

const dragOptions = {
  closeMenuItemText: "Close",
  menu: ContextualMenu,
  moveMenuItemText: "Move"
};

const modalProps = {
  dragOptions,
  isBlocking: true
};

export class ShiftCohort extends React.Component<
  IShiftCohortProps,
  IShiftCohortState
> {
  public constructor(props: IShiftCohortProps) {
    super(props);
    const options: IDropdownOption[] = props.cohorts.map(
      (errorCohort: ErrorCohort, index: number) => {
        return { key: index, text: errorCohort.cohort.name };
      }
    );
    this.state = {
      options,
      selectedCohort: 0
    };
  }

  public render(): React.ReactNode {
    return (
      <Dialog
        hidden={!this.props.isOpen}
        onDismiss={this.props.onDismiss}
        dialogContentProps={dialogContentProps}
        modalProps={modalProps}
        minWidth={740}
        maxWidth={1000}
      >
        <Dropdown
          placeholder="Select a cohort"
          label="Cohort list"
          selectedKey={this.state.selectedCohort}
          options={this.state.options}
          styles={dropdownStyles}
          onChange={this.onChange}
        />
        <CohortStats
          temporaryCohort={this.props.cohorts[this.state.selectedCohort]}
        ></CohortStats>
        <DialogFooter>
          <PrimaryButton onClick={this.onApplyClick.bind(this)} text="Apply" />
          <DefaultButton onClick={this.props.onDismiss} text="Cancel" />
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

  private shiftCohort(): void {
    this.props.onApply(this.props.cohorts[this.state.selectedCohort]);
  }

  private onApplyClick(): void {
    this.props.onDismiss();
    this.shiftCohort();
  }
}

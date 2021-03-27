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
import {
  ModelAssessmentContext,
  defaultModelAssessmentContext
} from "../../Context/ModelAssessmentContext";

import { CohortStats } from "../CohortStats/CohortStats";
import { ErrorCohort } from "../ErrorCohort";

export interface IShiftCohortProps {
  isOpen: boolean;
  onDismiss: () => void;
  onApply: (selectedCohort: ErrorCohort) => void;
}

export interface IShiftCohortState {
  options: IDropdownOption[];
  selectedCohort: number;
  savedCohorts: ErrorCohort[];
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
  public static contextType = ModelAssessmentContext;
  public context: React.ContextType<
    typeof ModelAssessmentContext
  > = defaultModelAssessmentContext;

  public constructor(props: IShiftCohortProps) {
    super(props);
    const savedCohorts = this.context.cohorts.filter(
      (cohort) => !cohort.isTemporary
    );
    const options: IDropdownOption[] = savedCohorts.map(
      (errorCohort: ErrorCohort, index: number) => {
        return { key: index, text: errorCohort.cohort.name };
      }
    );
    this.state = {
      options,
      selectedCohort: 0,
      savedCohorts: savedCohorts
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
          temporaryCohort={this.state.savedCohorts[this.state.selectedCohort]}
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
    this.props.onApply(this.state.savedCohorts[this.state.selectedCohort]);
  }

  private onApplyClick(): void {
    this.props.onDismiss();
    this.shiftCohort();
  }
}

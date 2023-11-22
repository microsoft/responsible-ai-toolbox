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
} from "@fluentui/react";
import { localization } from "@responsible-ai/localization";
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
  defaultCohort?: ErrorCohort;
}

export interface IShiftCohortState {
  options: IDropdownOption[];
  selectedCohort: number;
  savedCohorts: ErrorCohort[];
}

const dialogContentProps = {
  subText: localization.Core.ShiftCohort.subText,
  title: localization.Core.ShiftCohort.title,
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
  public context: React.ContextType<typeof ModelAssessmentContext> =
    defaultModelAssessmentContext;

  public constructor(props: IShiftCohortProps) {
    super(props);
    this.state = {
      options: [],
      savedCohorts: [],
      selectedCohort: 0
    };
  }

  public componentDidMount(): void {
    const savedCohorts = this.context.errorCohorts.filter(
      (errorCohort) => !errorCohort.isTemporary
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
          placeholder={localization.Core.ShiftCohort.selectCohort}
          label={localization.Core.ShiftCohort.cohortList}
          selectedKey={this.state.selectedCohort}
          options={this.state.options}
          styles={dropdownStyles}
          onChange={this.onChange}
          ariaLabel={localization.Core.ShiftCohort.cohortList}
        />
        <CohortStats
          temporaryCohort={this.state.savedCohorts[this.state.selectedCohort]}
        />
        <DialogFooter>
          <PrimaryButton
            onClick={this.onApplyClick}
            text={localization.Core.ShiftCohort.apply}
            ariaLabel={localization.Core.ShiftCohort.applyAriaLabel}
          />
          <DefaultButton
            onClick={this.props.onDismiss}
            text={localization.Core.ShiftCohort.cancel}
            ariaLabel={localization.Interpret.CohortEditor.cancelAriaLabel}
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

  private shiftCohort(): void {
    this.props.onApply(this.state.savedCohorts[this.state.selectedCohort]);
  }

  private onApplyClick = (): void => {
    this.props.onDismiss();
    this.shiftCohort();
  };
}

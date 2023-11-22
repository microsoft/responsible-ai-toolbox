// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IStackTokens,
  ITextFieldStyles,
  PrimaryButton,
  DefaultButton,
  ContextualMenu,
  Dialog,
  DialogType,
  DialogFooter,
  Stack,
  TextField
} from "@fluentui/react";
import { localization } from "@responsible-ai/localization";
import React from "react";

import {
  ModelAssessmentContext,
  defaultModelAssessmentContext
} from "../../Context/ModelAssessmentContext";
import { Cohort } from "../Cohort";
import { CohortFilters } from "../CohortFilters/CohortFilters";
import { CohortStats } from "../CohortStats/CohortStats";
import { ErrorCohort } from "../ErrorCohort";

export interface IEditCohortProps {
  isOpen: boolean;
  errorCohort: ErrorCohort;
  selectedCohort: ErrorCohort;
  onDismiss: () => void;
  onSave: (originalCohort: ErrorCohort, editedCohort: ErrorCohort) => void;
  onDelete: (cohort: ErrorCohort) => void;
}

export interface IEditCohortState {
  cohortName: string;
}

const dragOptions = {
  closeMenuItemText: "Close",
  menu: ContextualMenu,
  moveMenuItemText: "Move"
};

const modalProps = {
  dragOptions,
  isBlocking: true
};

const textFieldStyles: Partial<ITextFieldStyles> = {
  fieldGroup: { width: 200 }
};

const stackTokens: IStackTokens = { childrenGap: 5 };

export class EditCohort extends React.Component<
  IEditCohortProps,
  IEditCohortState
> {
  public static contextType = ModelAssessmentContext;
  public context: React.ContextType<typeof ModelAssessmentContext> =
    defaultModelAssessmentContext;

  public constructor(props: IEditCohortProps) {
    super(props);
    this.state = {
      cohortName: this.props.errorCohort.cohort.name
    };
  }

  public render(): React.ReactNode {
    const disableDelete =
      this.props.errorCohort.cohort.name ===
      this.props.selectedCohort.cohort.name;
    const dialogContentProps = {
      subText: localization.ErrorAnalysis.EditCohort.subText,
      title: this.props.errorCohort.cohort.name,
      type: DialogType.close
    };
    return (
      <Dialog
        hidden={!this.props.isOpen}
        onDismiss={this.props.onDismiss}
        dialogContentProps={dialogContentProps}
        modalProps={modalProps}
        minWidth={740}
        maxWidth={1000}
      >
        <TextField
          label={localization.ErrorAnalysis.EditCohort.cohortName}
          onChange={this.updateCohortName}
          defaultValue={this.state.cohortName}
          styles={textFieldStyles}
        />
        <CohortStats temporaryCohort={this.props.errorCohort} />
        <CohortFilters cohort={this.props.errorCohort} />
        <DialogFooter>
          <Stack
            horizontal
            disableShrink
            horizontalAlign="space-between"
            tokens={stackTokens}
          >
            <Stack.Item align="start">
              <DefaultButton
                onClick={this.deleteCohort}
                text={localization.Interpret.CohortEditor.delete}
                ariaLabel={localization.Interpret.CohortEditor.deleteAriaLabel}
                disabled={disableDelete}
              />
            </Stack.Item>
            <Stack.Item align="end">
              <Stack horizontal tokens={stackTokens}>
                <PrimaryButton
                  onClick={this.editCohort}
                  text={localization.Interpret.CohortEditor.save}
                  ariaLabel={localization.Interpret.CohortEditor.saveAriaLabel}
                />
                <DefaultButton
                  onClick={this.props.onDismiss}
                  text={localization.Interpret.CohortEditor.cancel}
                  ariaLabel={
                    localization.Interpret.CohortEditor.cancelAriaLabel
                  }
                />
              </Stack>
            </Stack.Item>
          </Stack>
        </DialogFooter>
      </Dialog>
    );
  }

  private updateCohortName = (
    _: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>,
    newValue?: string
  ): void => {
    if (!newValue) {
      newValue = "";
    }
    this.setState({ cohortName: newValue });
  };

  private deleteCohort = (): void => {
    this.props.onDismiss();
    this.props.onDelete(this.props.errorCohort);
  };

  private editCohort = (): void => {
    this.props.onDismiss();
    const errorCohort = this.props.errorCohort;
    const savedCohort = new ErrorCohort(
      new Cohort(
        this.state.cohortName,
        this.context.jointDataset,
        errorCohort.cohort.filters,
        errorCohort.cohort.compositeFilters
      ),
      this.context.jointDataset,
      errorCohort.cells,
      errorCohort.source,
      errorCohort.isTemporary,
      errorCohort.cohortStats
    );
    this.props.onSave(errorCohort, savedCohort);
  };
}

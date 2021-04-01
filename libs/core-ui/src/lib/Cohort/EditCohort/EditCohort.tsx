// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { localization } from "@responsible-ai/localization";
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
} from "office-ui-fabric-react";
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
  cohort: ErrorCohort;
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
  public context: React.ContextType<
    typeof ModelAssessmentContext
  > = defaultModelAssessmentContext;

  public constructor(props: IEditCohortProps) {
    super(props);
    this.state = {
      cohortName: this.props.cohort.cohort.name
    };
  }

  public render(): React.ReactNode {
    const disableDelete =
      this.props.cohort.cohort.name === this.props.selectedCohort.cohort.name;
    const dialogContentProps = {
      subText: localization.ErrorAnalysis.EditCohort.subText,
      title: this.props.cohort.cohort.name,
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
          onChange={this.updateCohortName.bind(this)}
          defaultValue={this.state.cohortName}
          styles={textFieldStyles}
        />
        <CohortStats temporaryCohort={this.props.cohort}></CohortStats>
        <CohortFilters cohort={this.props.cohort}></CohortFilters>
        <DialogFooter>
          <Stack
            horizontal
            disableShrink
            horizontalAlign="space-between"
            tokens={stackTokens}
          >
            <Stack.Item align="start">
              <DefaultButton
                onClick={this.deleteCohort.bind(this)}
                text="Delete"
                disabled={disableDelete}
              />
            </Stack.Item>
            <Stack.Item align="end">
              <Stack horizontal tokens={stackTokens}>
                <PrimaryButton
                  onClick={this.editCohort.bind(this)}
                  text="Save"
                />
                <DefaultButton onClick={this.props.onDismiss} text="Cancel" />
              </Stack>
            </Stack.Item>
          </Stack>
        </DialogFooter>
      </Dialog>
    );
  }

  private updateCohortName(
    _: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>,
    newValue?: string
  ): void {
    if (!newValue) {
      newValue = "";
    }
    this.setState({ cohortName: newValue });
  }

  private deleteCohort(): void {
    this.props.onDismiss();
    this.props.onDelete(this.props.cohort);
  }

  private editCohort(): void {
    this.props.onDismiss();
    const cohort = this.props.cohort;
    const savedCohort = new ErrorCohort(
      new Cohort(
        this.state.cohortName,
        this.context.jointDataset,
        cohort.cohort.filters,
        cohort.cohort.compositeFilters
      ),
      this.context.jointDataset,
      cohort.cells,
      cohort.source,
      cohort.isTemporary,
      cohort.cohortStats
    );
    this.props.onSave(cohort, savedCohort);
  }
}

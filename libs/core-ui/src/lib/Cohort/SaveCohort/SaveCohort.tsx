// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  ITextFieldStyles,
  PrimaryButton,
  DefaultButton,
  ContextualMenu,
  Dialog,
  DialogType,
  DialogFooter,
  TextField
} from "@fluentui/react";
import { localization } from "@responsible-ai/localization";
import React from "react";

import {
  ModelAssessmentContext,
  defaultModelAssessmentContext
} from "../../Context/ModelAssessmentContext";
import { Cohort } from "../Cohort";
import { CohortBaseAndFilters } from "../CohortBaseAndFilters/CohortBaseAndFilters";
import { CohortStats } from "../CohortStats/CohortStats";
import { ErrorCohort } from "../ErrorCohort";

export interface ISaveCohortProps {
  isOpen: boolean;
  temporaryCohort: ErrorCohort;
  baseCohort: ErrorCohort;
  onDismiss: () => void;
  onSave: (temporaryCohort: ErrorCohort, switchNew?: boolean) => void;
}

export interface ISaveCohortState {
  cohortName: string;
}

const dialogContentProps = {
  subText: localization.ErrorAnalysis.SaveCohort.subText,
  title: localization.ErrorAnalysis.SaveCohort.saveTitle,
  type: DialogType.close
};

const dragOptions = {
  closeMenuItemText: localization.ErrorAnalysis.SaveCohort.close,
  menu: ContextualMenu,
  moveMenuItemText: localization.ErrorAnalysis.SaveCohort.move
};

const modalProps = {
  dragOptions,
  isBlocking: true
};

const allDataCopy = localization.ErrorAnalysis.SaveCohort.defaultLabelCopy;

const textFieldStyles: Partial<ITextFieldStyles> = {
  fieldGroup: { width: 200 }
};

export class SaveCohort extends React.Component<
  ISaveCohortProps,
  ISaveCohortState
> {
  public static contextType = ModelAssessmentContext;
  public context: React.ContextType<typeof ModelAssessmentContext> =
    defaultModelAssessmentContext;

  public constructor(props: ISaveCohortProps) {
    super(props);
    this.state = {
      cohortName: allDataCopy
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
        <TextField
          label={localization.ErrorAnalysis.SaveCohort.cohortName}
          onChange={this.updateCohortName}
          defaultValue={allDataCopy}
          styles={textFieldStyles}
        />
        <CohortStats temporaryCohort={this.props.temporaryCohort} />
        <CohortBaseAndFilters
          cohort={this.props.temporaryCohort}
          baseCohort={this.props.baseCohort}
        />
        <DialogFooter>
          <PrimaryButton
            onClick={(): void => {
              this.props.onDismiss();
              this.saveCohort();
            }}
            text={localization.ErrorAnalysis.SaveCohort.save}
            ariaLabel={localization.Interpret.CohortEditor.saveAriaLabel}
          />
          <DefaultButton
            onClick={(): void => {
              this.props.onDismiss();
              this.saveCohort(true);
            }}
            ariaLabel={localization.Interpret.CohortEditor.saveAndSwitch}
          >
            {localization.Interpret.CohortEditor.saveAndSwitch}
          </DefaultButton>
          <DefaultButton
            onClick={this.props.onDismiss}
            text={localization.ErrorAnalysis.SaveCohort.cancel}
            ariaLabel={localization.Interpret.CohortEditor.cancelAriaLabel}
          />
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

  private saveCohort = (switchNew?: boolean): void => {
    const tempCohort = this.props.temporaryCohort;
    const savedCohort = new ErrorCohort(
      new Cohort(
        this.state.cohortName,
        this.context.jointDataset,
        tempCohort.cohort.filters,
        tempCohort.cohort.compositeFilters
      ),
      this.context.jointDataset,
      tempCohort.cells,
      tempCohort.source,
      false,
      tempCohort.cohortStats
    );
    this.props.onSave(savedCohort, switchNew);
  };
}

// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Cohort, JointDataset } from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import {
  ITextFieldStyles,
  PrimaryButton,
  DefaultButton,
  ContextualMenu,
  Dialog,
  DialogType,
  DialogFooter,
  TextField
} from "office-ui-fabric-react";
import React from "react";

import { ErrorCohort } from "../../ErrorCohort";
import { CohortBaseAndFilters } from "../CohortBaseAndFilters/CohortBaseAndFilters";
import { CohortStats } from "../CohortStats/CohortStats";

export interface ISaveCohortProps {
  isOpen: boolean;
  temporaryCohort: ErrorCohort;
  baseCohort: ErrorCohort;
  jointDataset: JointDataset;
  onDismiss: () => void;
  onSave: (temporaryCohort: ErrorCohort) => void;
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

const allDataCopy = "All data copy";

const textFieldStyles: Partial<ITextFieldStyles> = {
  fieldGroup: { width: 200 }
};

export class SaveCohort extends React.Component<
  ISaveCohortProps,
  ISaveCohortState
> {
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
          onChange={this.updateCohortName.bind(this)}
          defaultValue={allDataCopy}
          styles={textFieldStyles}
        />
        <CohortStats temporaryCohort={this.props.temporaryCohort}></CohortStats>
        <CohortBaseAndFilters
          cohort={this.props.temporaryCohort}
          baseCohort={this.props.baseCohort}
        ></CohortBaseAndFilters>
        <DialogFooter>
          <PrimaryButton
            onClick={(): void => {
              this.props.onDismiss();
              this.saveCohort.bind(this)();
            }}
            text={localization.ErrorAnalysis.SaveCohort.save}
          />
          <DefaultButton
            onClick={this.props.onDismiss}
            text={localization.ErrorAnalysis.SaveCohort.cancel}
          />
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

  private saveCohort(): void {
    const tempCohort = this.props.temporaryCohort;
    const savedCohort = new ErrorCohort(
      new Cohort(
        this.state.cohortName,
        this.props.jointDataset,
        tempCohort.cohort.filters,
        tempCohort.cohort.compositeFilters
      ),
      this.props.jointDataset,
      tempCohort.cells,
      tempCohort.source,
      false,
      tempCohort.cohortStats
    );
    this.props.onSave(savedCohort);
  }
}

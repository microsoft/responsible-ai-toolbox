// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  Cohort,
  JointDataset,
  IFilter,
  FilterMethods
} from "@responsible-ai/interpret";
import { ITextFieldStyles, IStackTokens } from "office-ui-fabric-react";
import {
  PrimaryButton,
  DefaultButton
} from "office-ui-fabric-react/lib/Button";
import { ContextualMenu } from "office-ui-fabric-react/lib/ContextualMenu";
import {
  Dialog,
  DialogType,
  DialogFooter
} from "office-ui-fabric-react/lib/Dialog";
import { Stack } from "office-ui-fabric-react/lib/Stack";
import { TextField } from "office-ui-fabric-react/lib/TextField";
import React from "react";

import { ErrorCohort } from "../../ErrorCohort";
import { CohortStats } from "../CohortStats/CohortStats";

import { saveCohortStyles } from "./SaveCohort.styles";

export interface ISaveCohortProps {
  isOpen: boolean;
  temporaryCohort: ErrorCohort;
  jointDataset: JointDataset;
  onDismiss: () => void;
  onSave: (temporaryCohort: ErrorCohort) => void;
}

export interface ISaveCohortState {
  cohortName: string;
}

const dialogContentProps = {
  subText:
    "Save the current cohort to the cohort list. You can revisit the save cohort via the cohort list.",
  title: "Save Cohort",
  type: DialogType.close
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

const alignmentStackTokens: IStackTokens = {
  childrenGap: 10,
  padding: 5
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
    const classNames = saveCohortStyles();
    const filters = this.props.temporaryCohort.cohort.filters
      .map((filter: IFilter): string => {
        let method = "";
        if (filter.method === FilterMethods.Equal) {
          method = "==";
        } else if (filter.method === FilterMethods.GreaterThan) {
          method = ">";
        } else if (filter.method === FilterMethods.GreaterThanEqualTo) {
          method = ">=";
        } else if (filter.method === FilterMethods.LessThan) {
          method = "<";
        } else if (filter.method === FilterMethods.LessThanEqualTo) {
          method = "<=";
        }
        return `${filter.column} ${method} ${filter.arg[0]}`;
      })
      .join(", ");
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
          label="Cohort name"
          onChange={this.updateCohortName.bind(this)}
          defaultValue={allDataCopy}
          styles={textFieldStyles}
        />
        <CohortStats temporaryCohort={this.props.temporaryCohort}></CohortStats>
        <div className={classNames.section}></div>
        <div className={classNames.subsection}>
          <div className={classNames.header}>Base cohort and filters</div>
          <Stack horizontal>
            <Stack>
              <Stack horizontal tokens={alignmentStackTokens}>
                <div className={classNames.tableData}>Base cohort</div>
              </Stack>
              <Stack horizontal tokens={alignmentStackTokens}>
                <div className={classNames.tableData}>Error explorer</div>
              </Stack>
              <Stack horizontal tokens={alignmentStackTokens}>
                <div className={classNames.tableData}>Filters</div>
              </Stack>
            </Stack>
            <Stack>
              <Stack horizontal tokens={alignmentStackTokens}>
                <div className={classNames.tableData}>All data</div>
              </Stack>
              <Stack horizontal tokens={alignmentStackTokens}>
                <div className={classNames.tableData}>Tree map</div>
              </Stack>
              <Stack horizontal tokens={alignmentStackTokens}>
                <div className={classNames.tableData}>{filters}</div>
              </Stack>
            </Stack>
          </Stack>
        </div>
        <DialogFooter>
          <PrimaryButton
            onClick={(): void => {
              this.props.onDismiss();
              this.saveCohort.bind(this)();
            }}
            text="Save"
          />
          <DefaultButton onClick={this.props.onDismiss} text="Cancel" />
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
        tempCohort.cohort.filters
      ),
      this.props.jointDataset
    );
    this.props.onSave(savedCohort);
  }
}

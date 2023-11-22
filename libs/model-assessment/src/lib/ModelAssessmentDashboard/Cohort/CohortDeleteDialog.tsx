// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  Dialog,
  DialogFooter,
  PrimaryButton,
  DefaultButton,
  DialogType,
  ContextualMenu
} from "@fluentui/react";
import { localization } from "@responsible-ai/localization";
import React from "react";

export interface ICohortDeleteDialogProps {
  currentDeleteIndex?: number;
  currentDeleteCohortName?: string;
  onDismiss?: () => void;
  onDeleteClick?: () => void;
}

export class CohortDeleteDialog extends React.Component<ICohortDeleteDialogProps> {
  public render(): React.ReactNode {
    const dialogContentProps = {
      subText: localization.ModelAssessment.Cohort.deleteConfirm,
      title: localization.formatString(
        localization.ModelAssessment.Cohort.deleteCohort,
        this.props.currentDeleteCohortName
      ),
      type: DialogType.close
    };
    return (
      <Dialog
        hidden={!this.props.currentDeleteIndex}
        onDismiss={this.props.onDismiss}
        dialogContentProps={dialogContentProps}
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
        <DialogFooter>
          <PrimaryButton
            onClick={this.props.onDeleteClick}
            text={localization.ModelAssessment.Cohort.delete}
            ariaLabel={localization.ModelAssessment.Cohort.deleteAriaLabel}
          />
          <DefaultButton
            onClick={this.props.onDismiss}
            text={localization.ModelAssessment.Cohort.cancel}
            ariaLabel={localization.ModelAssessment.Cohort.cancelAriaLabel}
          />
        </DialogFooter>
      </Dialog>
    );
  }
}

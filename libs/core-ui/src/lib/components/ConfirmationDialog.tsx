// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  DefaultButton,
  Dialog,
  DialogFooter,
  DialogType,
  PrimaryButton
} from "office-ui-fabric-react";
import React from "react";

interface IConfirmationDialogProps {
  confirmButtonText: string;
  cancelButtonText: string;
  title: string;
  subText: string;
  onConfirm(): void;
  onClose(): void;
}
export class ConfirmationDialog extends React.Component<
  IConfirmationDialogProps
> {
  public render(): React.ReactNode {
    const dialogContentProps = {
      subText: this.props.subText,
      title: this.props.title,
      type: DialogType.normal
    };
    const modalProps = {
      isBlocking: false
    };
    return (
      <Dialog
        maxWidth={"480px"}
        minWidth={"480px"}
        hidden={false}
        dialogContentProps={dialogContentProps}
        modalProps={modalProps}
      >
        <DialogFooter>
          <PrimaryButton
            onClick={this.props.onConfirm}
            text={this.props.confirmButtonText}
          />
          <DefaultButton
            onClick={this.props.onClose}
            text={this.props.cancelButtonText}
          />
        </DialogFooter>
      </Dialog>
    );
  }
}

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
  confirmButtonText?: string;
  title: string;
  subText: string;
  busy?: boolean;
  onConfirm(): void;
  onClose(): void;
}
export class ConfirmationDialog extends React.PureComponent<
  IConfirmationDialogProps
> {
  public render(): React.ReactNode {
    let confirmText = "Yes";
    let cancelText = "No";
    if (this.props.confirmButtonText) {
      confirmText = this.props.confirmButtonText;
      cancelText = "Cancel";
    }
    const dialogContentProps = {
      closeButtonAriaLabel: "Close",
      subText: this.props.subText,
      title: this.props.title,
      type: DialogType.normal
    };
    const modalProps = {
      isBlocking: true
    };
    return (
      <Dialog
        hidden={false}
        dialogContentProps={dialogContentProps}
        modalProps={modalProps}
      >
        <DialogFooter>
          <PrimaryButton onClick={this.props.onConfirm} text={confirmText} />
          <DefaultButton onClick={this.props.onClose} text={cancelText} />
        </DialogFooter>
      </Dialog>
    );
  }
}

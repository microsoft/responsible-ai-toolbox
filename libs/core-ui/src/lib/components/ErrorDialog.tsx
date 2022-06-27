// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  DefaultButton,
  Dialog,
  DialogFooter,
  DialogType
} from "@fluentui/react";
import React from "react";

export interface IErrorDialogProps {
  cancelButtonText: string;
  title: string;
  subText: string;
  onClose(): void;
}
export class ErrorDialog extends React.Component<IErrorDialogProps> {
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
          <DefaultButton
            onClick={this.props.onClose}
            text={this.props.cancelButtonText}
          />
        </DialogFooter>
      </Dialog>
    );
  }
}

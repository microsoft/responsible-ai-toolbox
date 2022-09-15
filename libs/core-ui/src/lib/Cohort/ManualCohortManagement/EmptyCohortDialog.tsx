// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Dialog, DialogType } from "@fluentui/react";
import { localization } from "@responsible-ai/localization";
import React from "react";

export interface IEmptyCohortDialogProps {
  onClose(): void;
}

export class EmptyCohortDialog extends React.Component<IEmptyCohortDialogProps> {
  public render(): React.ReactNode {
    const dialogContentProps = {
      className: "emptyCohortDialog",
      subText: localization.Core.EmptyCohortDialog.subText,
      title: localization.Core.EmptyCohortDialog.title,
      type: DialogType.normal
    };
    const modalProps = {
      isBlocking: true
    };
    return (
      <Dialog
        maxWidth={"480px"}
        minWidth={"480px"}
        hidden={false}
        dialogContentProps={dialogContentProps}
        modalProps={modalProps}
        onDismiss={(): void => this.props.onClose()}
      />
    );
  }
}

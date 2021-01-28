// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { localization } from "@responsible-ai/localization";
import {
  ContextualMenu,
  DefaultButton,
  Dialog,
  DialogType,
  DialogFooter,
  IStackTokens,
  PrimaryButton,
  Stack
} from "office-ui-fabric-react";
import React from "react";

export interface IMapShiftProps {
  isOpen: boolean;
  onDismiss: () => void;
  onSave: () => void;
  onShift: () => void;
}

const dialogContentProps = {
  subText: localization.ErrorAnalysis.MapShift.subText,
  title: localization.ErrorAnalysis.MapShift.title,
  type: DialogType.close
};

const dragOptions = {
  closeMenuItemText: localization.ErrorAnalysis.MapShift.close,
  menu: ContextualMenu,
  moveMenuItemText: localization.ErrorAnalysis.MapShift.move
};

const modalProps = {
  dragOptions,
  isBlocking: true
};

const stackTokens: IStackTokens = { childrenGap: 5 };

export class MapShift extends React.Component<IMapShiftProps> {
  public render(): React.ReactNode {
    return (
      <Dialog
        hidden={!this.props.isOpen}
        onDismiss={this.props.onDismiss}
        dialogContentProps={dialogContentProps}
        modalProps={modalProps}
        minWidth={250}
        maxWidth={500}
      >
        <DialogFooter>
          <Stack
            horizontal
            disableShrink
            horizontalAlign="space-between"
            tokens={stackTokens}
          >
            <Stack.Item align="start">
              <DefaultButton
                onClick={this.props.onSave.bind(this)}
                text={localization.ErrorAnalysis.MapShift.saveAs}
              />
            </Stack.Item>
            <Stack.Item align="end">
              <Stack horizontal tokens={stackTokens}>
                <PrimaryButton
                  onClick={this.shift.bind(this)}
                  text={localization.ErrorAnalysis.MapShift.shift}
                />
                <DefaultButton
                  onClick={this.props.onDismiss}
                  text={localization.ErrorAnalysis.MapShift.cancel}
                />
              </Stack>
            </Stack.Item>
          </Stack>
        </DialogFooter>
      </Dialog>
    );
  }

  private shift(): void {
    this.props.onDismiss();
    this.props.onShift();
  }
}

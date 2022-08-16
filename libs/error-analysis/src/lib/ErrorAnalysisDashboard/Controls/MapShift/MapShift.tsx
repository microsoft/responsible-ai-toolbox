// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  ContextualMenu,
  DefaultButton,
  Dialog,
  DialogType,
  DialogFooter,
  IStackTokens,
  PrimaryButton,
  Stack
} from "@fluentui/react";
import { localization } from "@responsible-ai/localization";
import React from "react";

import { ErrorAnalysisOptions } from "../../ErrorAnalysisEnums";

export interface IMapShiftProps {
  isOpen: boolean;
  onDismiss: () => void;
  onSave: () => void;
  onShift: () => void;
  currentOption: ErrorAnalysisOptions;
}

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
    const dialogContentProps = {
      subText:
        this.props.currentOption === ErrorAnalysisOptions.TreeMap
          ? localization.ErrorAnalysis.MapShift.treeSubText
          : localization.ErrorAnalysis.MapShift.heatSubText,
      title:
        this.props.currentOption === ErrorAnalysisOptions.TreeMap
          ? localization.ErrorAnalysis.MapShift.treeTitle
          : localization.ErrorAnalysis.MapShift.heatTitle,
      type: DialogType.close
    };
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
                onClick={this.onSave}
                text={localization.ErrorAnalysis.MapShift.saveAs}
              />
            </Stack.Item>
            <Stack.Item align="end">
              <Stack horizontal tokens={stackTokens}>
                <PrimaryButton
                  onClick={this.shift}
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

  private shift = (): void => {
    this.props.onDismiss();
    this.props.onShift();
  };

  private onSave = (): void => {
    this.props.onSave();
  };
}

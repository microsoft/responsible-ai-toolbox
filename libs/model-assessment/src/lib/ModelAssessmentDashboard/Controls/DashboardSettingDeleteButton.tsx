// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IconButton } from "@fluentui/react";
import { ConfirmationDialog } from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import React from "react";

export interface IDashboardSettingDeleteButtonProps {
  index: number;
  name: string;
  removeTab(index: number): void;
}
export interface IDashboardSettingDeleteButtonState {
  showConfirmDialog: boolean;
}

export class DashboardSettingDeleteButton extends React.PureComponent<
  IDashboardSettingDeleteButtonProps,
  IDashboardSettingDeleteButtonState
> {
  public render(): React.ReactNode {
    return (
      <>
        <IconButton
          iconProps={{ iconName: "Delete" }}
          onClick={this.showDialog}
          ariaLabel={
            localization.ModelAssessment.DashboardSettings.DeleteDialog.Delete
          }
        />
        {this.state?.showConfirmDialog && (
          <ConfirmationDialog
            onConfirm={this.removeTab}
            onClose={this.hideDialog}
            title={localization.formatString(
              localization.ModelAssessment.DashboardSettings.DeleteDialog.Title,
              this.props.name
            )}
            subText={localization.formatString(
              localization.ModelAssessment.DashboardSettings.DeleteDialog
                .Content,
              this.props.name
            )}
            confirmButtonText={
              localization.ModelAssessment.DashboardSettings.DeleteDialog.Delete
            }
            cancelButtonText={
              localization.ModelAssessment.DashboardSettings.DeleteDialog.Cancel
            }
          />
        )}
      </>
    );
  }

  private showDialog = (): void => {
    this.setState({ showConfirmDialog: true });
  };

  private hideDialog = (): void => {
    this.setState({ showConfirmDialog: false });
  };

  private removeTab = (): void => {
    this.props.removeTab(this.props.index);
    this.hideDialog();
  };
}

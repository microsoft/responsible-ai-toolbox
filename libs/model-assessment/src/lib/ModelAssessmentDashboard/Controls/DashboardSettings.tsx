// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IColumn, Panel, SelectionMode, Text } from "@fluentui/react";
import { AccessibleDetailsList } from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import React from "react";

import { IModelAssessmentDashboardTab } from "../ModelAssessmentDashboardState";

import { DashboardSettingDeleteButton } from "./DashboardSettingDeleteButton";

export interface IDashboardSettingsProps {
  isOpen: boolean;
  activeGlobalTabs: IModelAssessmentDashboardTab[];
  onDismiss(): void;
  removeTab(index: number): void;
}

export class DashboardSettings extends React.PureComponent<IDashboardSettingsProps> {
  public render(): React.ReactNode {
    const columns: IColumn[] = [
      {
        fieldName: "name",
        key: "name",
        minWidth: 50,
        name: localization.ModelAssessment.DashboardSettings.DashboardComponents
      },
      {
        fieldName: "name",
        key: "delete",
        minWidth: 20,
        name: "",
        onRender: this.renderDelete
      }
    ];
    return (
      <Panel
        headerText={localization.ModelAssessment.DashboardSettings.Title}
        isOpen={this.props.isOpen}
        // You MUST provide this prop! Otherwise screen readers will just say "button" with no label.
        closeButtonAriaLabel={localization.Common.close}
        isBlocking={false}
        onDismiss={this.props.onDismiss}
        title={localization.ModelAssessment.DashboardSettings.Title}
      >
        <Text>{localization.ModelAssessment.DashboardSettings.Content}</Text>
        <AccessibleDetailsList
          items={this.props.activeGlobalTabs.map((a) => ({
            // removing key here because fluent ui also pick it to identify row
            name: a.name
          }))}
          columns={columns}
          selectionMode={SelectionMode.none}
        />
      </Panel>
    );
  }
  private renderDelete = (
    item?: IModelAssessmentDashboardTab,
    index?: number | undefined
  ): React.ReactNode => {
    if (!index || !item) {
      return React.Fragment;
    }
    return (
      <DashboardSettingDeleteButton
        name={item.name}
        index={index}
        removeTab={this.props.removeTab}
        key={index}
      />
    );
  };
}

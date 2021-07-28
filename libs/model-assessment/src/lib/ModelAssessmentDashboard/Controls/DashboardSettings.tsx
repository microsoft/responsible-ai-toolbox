// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { localization } from "@responsible-ai/localization";
import {
  DetailsList,
  IColumn,
  Panel,
  SelectionMode,
  Text
} from "office-ui-fabric-react";
import React from "react";

import { IModelAssessmentDashboardTab } from "../ModelAssessmentDashboardState";

import { DashboardSettingDeleteButton } from "./DashboardSettingDeleteButton";

export interface IDashboardSettingsProps {
  isOpen: boolean;
  activeGlobalTabs: IModelAssessmentDashboardTab[];
  onDismiss(): void;
  removeTab(index: number): void;
}

export class DashboardSettings extends React.PureComponent<
  IDashboardSettingsProps
> {
  public render(): React.ReactNode {
    const columns: IColumn[] = [
      {
        fieldName: "key",
        key: "key",
        minWidth: 50,
        name: localization.ModelAssessment.DashboardSettings.DashboardComponents
      },
      {
        fieldName: "dataCount",
        key: "dataCount",
        minWidth: 50,
        name: localization.ModelAssessment.DashboardSettings.DataPoints
      },
      {
        fieldName: "key",
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
        closeButtonAriaLabel="Close"
        isBlocking={false}
        onDismiss={this.props.onDismiss}
        title={localization.ModelAssessment.DashboardSettings.Title}
      >
        <Text>{localization.ModelAssessment.DashboardSettings.Content}</Text>
        <DetailsList
          items={this.props.activeGlobalTabs}
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
        name={item.key}
        index={index}
        removeTab={this.props.removeTab}
      />
    );
  };
}

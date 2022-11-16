// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Stack, Pivot, PivotItem } from "@fluentui/react";
import { localization } from "@responsible-ai/localization";
import React from "react";

import { visionExplanationDashboardStyles } from "../VisionExplanationDashboard.styles";
import { VisionDatasetExplorerTabOptions } from "../VisionExplanationDashboardHelper";

export interface IPivotsProps {
  selectedKey: string;
  onLinkClick: (item?: PivotItem) => void;
}

export class Pivots extends React.Component<IPivotsProps> {
  public render(): React.ReactNode {
    const classNames = visionExplanationDashboardStyles();
    return (
      <Stack horizontal horizontalAlign="space-between" verticalAlign="end">
        <Pivot
          selectedKey={this.props.selectedKey}
          onLinkClick={this.props.onLinkClick}
          linkSize={"normal"}
          headersOnly
          className={classNames.tabs}
          overflowBehavior="menu"
        >
          <PivotItem
            headerText={localization.InterpretVision.Dashboard.tabOptionFirst}
            itemKey={VisionDatasetExplorerTabOptions.ImageExplorerView}
          />
          <PivotItem
            headerText={localization.InterpretVision.Dashboard.tabOptionSecond}
            itemKey={VisionDatasetExplorerTabOptions.TableView}
          />
          <PivotItem
            headerText={localization.InterpretVision.Dashboard.tabOptionThird}
            itemKey={VisionDatasetExplorerTabOptions.DataCharacteristics}
          />
        </Pivot>
      </Stack>
    );
  }
}

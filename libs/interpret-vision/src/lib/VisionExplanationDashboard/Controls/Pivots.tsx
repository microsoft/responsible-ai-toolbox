// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Stack, Pivot, PivotItem, CommandBarButton } from "@fluentui/react";
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
      <Stack>
        <Stack.Item>
          <Stack horizontal horizontalAlign="space-between" verticalAlign="end">
            <Stack.Item>
              <Pivot
                selectedKey={this.props.selectedKey}
                onLinkClick={this.props.onLinkClick}
                linkSize={"normal"}
                headersOnly
                className={classNames.tabs}
              >
                <PivotItem
                  headerText={
                    localization.InterpretVision.Dashboard.tabOptionFirst
                  }
                  itemKey={VisionDatasetExplorerTabOptions.ImageExplorerView}
                />
                <PivotItem
                  headerText={
                    localization.InterpretVision.Dashboard.tabOptionSecond
                  }
                  itemKey={VisionDatasetExplorerTabOptions.TableView}
                />
                <PivotItem
                  headerText={
                    localization.InterpretVision.Dashboard.tabOptionThird
                  }
                  itemKey={VisionDatasetExplorerTabOptions.DataCharacteristics}
                />
              </Pivot>
            </Stack.Item>
            <Stack.Item>
              <CommandBarButton
                className={classNames.filterButton}
                iconProps={{ iconName: "Settings" }}
                text={localization.InterpretVision.Dashboard.settings}
              />
            </Stack.Item>
          </Stack>
        </Stack.Item>
      </Stack>
    );
  }
}

// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Stack, Dropdown, IDropdownOption, Text } from "@fluentui/react";
import { localization } from "@responsible-ai/localization";
import React from "react";

import { VisionDatasetExplorerTabOptions } from "../VisionExplanationDashboard";

export interface IPageSizeSelectorsProps {
  selectedKey: string;
  onNumRowsSelect?: (
    _event: React.FormEvent<HTMLDivElement>,
    item: IDropdownOption | undefined
  ) => void;
  onPageSizeSelect: (
    _event: React.FormEvent<HTMLDivElement>,
    item: IDropdownOption | undefined
  ) => void;
}

const PageSizeOptions: IDropdownOption[] = [
  { key: "s", text: "10" },
  { key: "m", text: "25" },
  { key: "l", text: "50" },
  { key: "xl", text: "100" }
];

const NumRowsOptions: IDropdownOption[] = [
  { key: "1", text: "1" },
  { key: "2", text: "2" },
  { key: "3", text: "3" },
  { key: "4", text: "4" },
  { key: "5", text: "5" }
];

const stackTokens = {
  childrenGap: "s1"
};

export class PageSizeSelectors extends React.Component<IPageSizeSelectorsProps> {
  public render(): React.ReactNode {
    return (
      <Stack horizontal tokens={stackTokens} verticalAlign="center">
        <Stack.Item>
          <Text>
            {this.props.selectedKey ===
            VisionDatasetExplorerTabOptions.TableView
              ? localization.InterpretVision.Dashboard.pageSize
              : localization.InterpretVision.Dashboard.rows}
          </Text>
        </Stack.Item>
        <Stack.Item>
          {this.props.selectedKey ===
          VisionDatasetExplorerTabOptions.TableView ? (
            <Dropdown
              defaultSelectedKey="s"
              options={PageSizeOptions}
              onChange={this.props.onPageSizeSelect}
            />
          ) : (
            <Dropdown
              defaultSelectedKey="3"
              options={NumRowsOptions}
              onChange={this.props.onNumRowsSelect}
            />
          )}
        </Stack.Item>
      </Stack>
    );
  }
}

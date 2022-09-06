// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  Stack,
  Dropdown,
  IDropdownOption,
  SearchBox,
  CommandBarButton,
  Text
} from "@fluentui/react";
import { localization } from "@responsible-ai/localization";
import React from "react";

import { visionExplanationDashboardStyles } from "../VisionExplanationDashboard.styles";

export interface IToolBarProps {
  searchValue: string;
  onSearch: (
    _event?: React.ChangeEvent<HTMLInputElement>,
    newValue?: string
  ) => void;
}

export class ToolBar extends React.Component<IToolBarProps> {
  public render(): React.ReactNode {
    const classNames = visionExplanationDashboardStyles();
    const dropdownOptions: Array<IDropdownOption<unknown>> = [
      { key: 0, text: localization.InterpretVision.Dashboard.allData }
    ];
    return (
      <Stack>
        <Stack.Item className={classNames.cohortPickerLabelWrapper}>
          <Text variant="mediumPlus" className={classNames.cohortPickerLabel}>
            {localization.Interpret.ModelPerformance.cohortPickerLabel}
          </Text>
        </Stack.Item>
        <Stack.Item>
          <Stack
            horizontal
            className={classNames.toolBarContainer}
            tokens={{ childrenGap: "l1" }}
            verticalAlign="center"
          >
            <Stack.Item>
              <Dropdown
                className={classNames.cohortDropdown}
                id="dataExplorerCohortDropdown"
                options={dropdownOptions}
                selectedKey={0}
              />
            </Stack.Item>
            <Stack.Item>
              <SearchBox
                className={classNames.searchBox}
                placeholder={localization.InterpretVision.Dashboard.search}
                value={this.props.searchValue}
                onChange={this.props.onSearch}
              />
            </Stack.Item>
            <Stack.Item>
              <CommandBarButton
                className={classNames.filterButton}
                iconProps={{ iconName: "Filter" }}
                text={localization.InterpretVision.Dashboard.filter}
              />
            </Stack.Item>
          </Stack>
        </Stack.Item>
      </Stack>
    );
  }
}

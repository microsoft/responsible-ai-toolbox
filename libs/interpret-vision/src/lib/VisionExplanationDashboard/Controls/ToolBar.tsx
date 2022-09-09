// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  Stack,
  Dropdown,
  IDropdownOption,
  SearchBox,
  Text
} from "@fluentui/react";
import { ErrorCohort } from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import React from "react";

import { visionExplanationDashboardStyles } from "../VisionExplanationDashboard.styles";

export interface IToolBarProps {
  cohorts: ErrorCohort[];
  searchValue: string;
  onSearch: (
    _event?: React.ChangeEvent<HTMLInputElement>,
    newValue?: string
  ) => void;
  selectedCohort: ErrorCohort;
  setSelectedCohort: (cohort: ErrorCohort) => void;
}

export class ToolBar extends React.Component<IToolBarProps> {
  public render(): React.ReactNode {
    const classNames = visionExplanationDashboardStyles();
    const dropdownOptions: Array<IDropdownOption<unknown>> =
      this.props.cohorts.map((cohort) => {
        return { key: cohort.cohort.name, text: cohort.cohort.name };
      });
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
                selectedKey={this.props.selectedCohort.cohort.name}
                onChange={this.onSelect}
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
          </Stack>
        </Stack.Item>
      </Stack>
    );
  }

  private onSelect = (
    _event: React.FormEvent<HTMLDivElement>,
    option?: IDropdownOption<any>
  ): void => {
    if (!option) {
      return;
    }
    this.props.cohorts.forEach((cohort) => {
      if (cohort.cohort.name === option.text) {
        this.props.setSelectedCohort(cohort);
        return;
      }
    });
  };
}

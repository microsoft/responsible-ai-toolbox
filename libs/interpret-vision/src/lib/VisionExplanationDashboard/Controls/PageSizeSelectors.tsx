// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Stack, Dropdown, IDropdownOption, Text } from "@fluentui/react";
import { localization } from "@responsible-ai/localization";
import React from "react";

export interface IPageSizeSelectorsProps {
  selectedKey: string;
  onNumRowsSelect?: (
    _event: React.FormEvent<HTMLDivElement>,
    item: IDropdownOption | undefined
  ) => void;
}

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
      <Stack
        horizontal
        tokens={stackTokens}
        verticalAlign="center"
        id="pageSizeSelector"
      >
        <Stack.Item>
          <Text>{localization.InterpretVision.Dashboard.rows}</Text>
        </Stack.Item>
        <Stack.Item>
          <Dropdown
            defaultSelectedKey="3"
            options={NumRowsOptions}
            onChange={this.props.onNumRowsSelect}
            ariaLabel={localization.InterpretVision.Dashboard.rowsAriaLabel}
          />
        </Stack.Item>
      </Stack>
    );
  }
}

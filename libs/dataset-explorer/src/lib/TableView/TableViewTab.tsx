// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Stack, Text } from "@fluentui/react";
import { localization } from "@responsible-ai/localization";
import React from "react";

import { TableView } from "./TableView";
import { ITableViewProps } from "./TableViewProps";
import { tableViewTabStyles } from "./TableViewTab.styles";

export class TableViewTab extends React.Component<ITableViewProps> {
  public render(): React.ReactNode {
    const classNames = tableViewTabStyles();
    return (
      <Stack tokens={{ padding: "l1" }}>
        <Stack.Item className={classNames.infoWithText}>
          <Text variant="medium">
            {localization.ModelAssessment.TableViewTab.Heading}
          </Text>
        </Stack.Item>
        <Stack.Item>
          <TableView
            features={this.props.features}
            jointDataset={this.props.jointDataset}
            selectedCohort={this.props.selectedCohort}
            modelType={this.props.modelType}
            telemetryHook={this.props.telemetryHook}
          />
        </Stack.Item>
      </Stack>
    );
  }
}

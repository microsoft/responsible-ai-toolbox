// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Pivot, PivotItem, Stack } from "@fluentui/react";
import { localization } from "@responsible-ai/localization";
import React from "react";

import { DataBalanceTab } from "./DataBalanceTab";
import { dataExplorerParentTabStyles } from "./DataExplorerParentTab.styles";
import { DatasetExplorerTab } from "./DatasetExplorerTab";

interface IDataExplorerParentTabProps {
  showDataBalanceExperience: boolean;
}

interface IDataExplorerParentTabState {
  activeViewOption: DataExplorerParentTabOptions;
}

enum DataExplorerParentTabOptions {
  DatasetExplorer = "DatasetExplorer",
  DataBalance = "DataBalance"
}

export class DataExplorerParentTab extends React.Component<
  IDataExplorerParentTabProps,
  IDataExplorerParentTabState
> {
  public constructor(props: IDataExplorerParentTabProps) {
    super(props);
    this.state = {
      activeViewOption: DataExplorerParentTabOptions.DatasetExplorer
    };
  }

  public render(): React.ReactNode {
    const styles = dataExplorerParentTabStyles();

    if (!this.props.showDataBalanceExperience) {
      return <DatasetExplorerTab />;
    }

    return (
      <Stack>
        <Stack.Item>
          <Stack
            horizontal
            tokens={{ childrenGap: "s1", padding: "l1" }}
            className={styles.container}
          >
            <Pivot onLinkClick={this.onViewTypeChange}>
              <PivotItem
                itemKey={DataExplorerParentTabOptions.DatasetExplorer}
                headerText={
                  localization.ModelAssessment.ComponentNames.DataExplorer
                }
              />
              <PivotItem
                itemKey={DataExplorerParentTabOptions.DataBalance}
                headerText={
                  localization.ModelAssessment.ComponentNames.DataBalance
                }
              />
            </Pivot>
          </Stack>
        </Stack.Item>
        <Stack.Item>
          {this.state.activeViewOption ===
            DataExplorerParentTabOptions.DatasetExplorer && (
            <DatasetExplorerTab />
          )}
          {this.state.activeViewOption ===
            DataExplorerParentTabOptions.DataBalance && <DataBalanceTab />}
        </Stack.Item>
      </Stack>
    );
  }

  private onViewTypeChange = (item?: PivotItem): void => {
    if (
      item &&
      item.props.itemKey &&
      item.props.itemKey !== this.state.activeViewOption
    ) {
      this.setState({
        activeViewOption: item.props.itemKey as DataExplorerParentTabOptions
      });
    }
  };
}

// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Pivot, PivotItem } from "office-ui-fabric-react";
import React from "react";

import { DataBalanceTab } from "./DataBalanceTab";
import { DefaultTab } from "./DefaultTab";

export enum DatasetExplorerTabKeys {
  DefaultTab = "DefaultTab",
  DataBalanceTab = "DataBalanceTab"
}

export class IDatasetExplorerTabProps {}

export class DatasetExplorerTab extends React.Component<IDatasetExplorerTabProps> {
  public render(): React.ReactNode {
    return (
      <Pivot>
        <PivotItem
          itemKey={DatasetExplorerTabKeys.DefaultTab}
          headerText="Default" // TODO: Replace with localization
        >
          <DefaultTab />
        </PivotItem>
        <PivotItem
          itemKey={DatasetExplorerTabKeys.DataBalanceTab}
          headerText="Data Balance Analysis" // TODO: Replace with localization
        >
          <DataBalanceTab />
        </PivotItem>
      </Pivot>
    );
  }
}

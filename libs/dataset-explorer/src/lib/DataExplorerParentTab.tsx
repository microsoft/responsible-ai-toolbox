// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Pivot, PivotItem } from "@fluentui/react";
import { localization } from "@responsible-ai/localization";
import React from "react";

import { DataBalanceTab } from "./DataBalanceTab";
import { dataExplorerParentTabStyles } from "./DataExplorerParentTab.styles";
import { DatasetExplorerTab } from "./DatasetExplorerTab";

interface IDataExplorerParentTabProps {
  showDataBalanceExperience: boolean;
}

enum DataExplorerParentTabOptions {
  DatasetExplorer = "DatasetExplorer",
  DataBalance = "DataBalance"
}

export class DataExplorerParentTab extends React.Component<IDataExplorerParentTabProps> {
  public render(): React.ReactNode {
    const styles = dataExplorerParentTabStyles();

    if (!this.props.showDataBalanceExperience) {
      return <DatasetExplorerTab />;
    }

    return (
      <Pivot
        className={styles.container}
        styles={{ root: styles.pivotLabelWrapper }}
      >
        <PivotItem
          itemKey={DataExplorerParentTabOptions.DatasetExplorer}
          headerText={localization.ModelAssessment.ComponentNames.DataExplorer}
        >
          <DatasetExplorerTab />
        </PivotItem>

        <PivotItem
          itemKey={DataExplorerParentTabOptions.DataBalance}
          headerText={localization.ModelAssessment.ComponentNames.DataBalance}
        >
          <DataBalanceTab />
        </PivotItem>
      </Pivot>
    );
  }
}

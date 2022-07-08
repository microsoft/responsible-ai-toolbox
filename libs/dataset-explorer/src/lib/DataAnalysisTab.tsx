// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Pivot, PivotItem } from "@fluentui/react";
import { localization } from "@responsible-ai/localization";
import React from "react";

import { dataAnalysisTabStyles } from "./DataAnalysisTab.styles";
import { DataBalanceTab } from "./DataBalanceTab";
import { DatasetExplorerTab } from "./DatasetExplorerTab";

interface IDataAnalysisTabProps {
  showDataBalanceExperience: boolean;
}

enum DataAnalysisTabOptions {
  DatasetExplorer = "DatasetExplorer",
  DataBalance = "DataBalance"
}

export class DataAnalysisTab extends React.Component<IDataAnalysisTabProps> {
  public render(): React.ReactNode {
    const styles = dataAnalysisTabStyles();

    return (
      <Pivot
        className={styles.container}
        styles={{ root: styles.pivotLabelWrapper }}
      >
        <PivotItem
          itemKey={DataAnalysisTabOptions.DatasetExplorer}
          headerText={localization.ModelAssessment.ComponentNames.DataExplorer}
        >
          <DatasetExplorerTab />
        </PivotItem>

        {this.props.showDataBalanceExperience ? (
          <PivotItem
            itemKey={DataAnalysisTabOptions.DataBalance}
            headerText={localization.ModelAssessment.ComponentNames.DataBalance}
          >
            <DataBalanceTab />
          </PivotItem>
        ) : undefined}
      </Pivot>
    );
  }
}

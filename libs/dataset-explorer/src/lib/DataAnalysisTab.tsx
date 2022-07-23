// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Pivot, PivotItem } from "@fluentui/react";
import {
  ITelemetryEvent,
  TelemetryEventName,
  TelemetryLevels
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import React from "react";

import { dataAnalysisTabStyles } from "./DataAnalysisTab.styles";
import { DataBalanceTab } from "./DataBalanceTab";
import { DatasetExplorerTab } from "./DatasetExplorerTab";

interface IDataAnalysisTabProps {
  telemetryHook?: (message: ITelemetryEvent) => void;
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
        onLinkClick={this.onTabClick}
        id="dataAnalysisPivot"
      >
        <PivotItem
          itemKey={DataAnalysisTabOptions.DatasetExplorer}
          headerText={localization.ModelAssessment.ComponentNames.DataExplorer}
        >
          <DatasetExplorerTab telemetryHook={this.props.telemetryHook} />
        </PivotItem>

        {this.props.showDataBalanceExperience ? (
          <PivotItem
            itemKey={DataAnalysisTabOptions.DataBalance}
            headerText={localization.ModelAssessment.ComponentNames.DataBalance}
          >
            <DataBalanceTab telemetryHook={this.props.telemetryHook} />
          </PivotItem>
        ) : undefined}
      </Pivot>
    );
  }

  private onTabClick = (item?: PivotItem): void => {
    this.props.telemetryHook?.({
      level: TelemetryLevels.ButtonClick,
      type: this.getTelemetryEventName(item?.props.itemKey)
    });
  };

  private getTelemetryEventName = (itemKey?: string) => {
    switch (itemKey) {
      case DataAnalysisTabOptions.DatasetExplorer:
        return TelemetryEventName.DatasetExplorerTabSelected;
      case DataAnalysisTabOptions.DataBalance:
        return TelemetryEventName.DataBalanceTabSelected;
      default:
        return TelemetryEventName.DatasetExplorerTabSelected;
    }
  };
}

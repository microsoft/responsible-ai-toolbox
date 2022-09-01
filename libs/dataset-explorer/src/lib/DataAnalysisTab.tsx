// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IObjectWithKey, Pivot, PivotItem } from "@fluentui/react";
import {
  defaultModelAssessmentContext,
  ModelAssessmentContext,
  ITelemetryEvent,
  TelemetryEventName,
  TelemetryLevels
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import React from "react";

import { dataAnalysisTabStyles } from "./DataAnalysisTab.styles";
import { DataBalanceTab } from "./DataBalanceTab";
import { DatasetExplorerTab } from "./DatasetExplorerTab";
import { TableView } from "./TableView/TableView";

interface IDataAnalysisTabProps {
  onAllSelectedItemsChange: (allSelectedItems: IObjectWithKey[]) => void;
  telemetryHook?: (message: ITelemetryEvent) => void;
  showDataBalanceExperience: boolean;
  onPivotChange?: (option: DataAnalysisTabOptions) => void;
}

export enum DataAnalysisTabOptions {
  ChartView = "ChartView",
  DataBalance = "DataBalance",
  TableView = "TableView"
}

export class DataAnalysisTab extends React.Component<IDataAnalysisTabProps> {
  public static contextType = ModelAssessmentContext;
  public context: React.ContextType<typeof ModelAssessmentContext> =
    defaultModelAssessmentContext;

  public render(): React.ReactNode {
    const styles = dataAnalysisTabStyles();

    return (
      <Pivot
        className={styles.container}
        styles={{ root: styles.pivotLabelWrapper }}
        onLinkClick={this.onTabClick}
        id="dataAnalysisPivot"
        overflowBehavior="menu"
      >
        <PivotItem
          itemKey={DataAnalysisTabOptions.TableView}
          headerText={localization.ModelAssessment.ComponentNames.TableView}
        >
          <TableView
            features={this.context.modelMetadata.featureNames}
            jointDataset={this.context.jointDataset}
            selectedCohort={this.context.selectedErrorCohort}
            modelType={this.context.modelMetadata.modelType}
            onAllSelectedItemsChange={this.props.onAllSelectedItemsChange}
            telemetryHook={this.props.telemetryHook}
          />
        </PivotItem>

        <PivotItem
          itemKey={DataAnalysisTabOptions.ChartView}
          headerText={localization.ModelAssessment.ComponentNames.ChartView}
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
    if (item && item.props.itemKey) {
      this.props.onPivotChange?.(item.props.itemKey as DataAnalysisTabOptions);
    }
  };

  private getTelemetryEventName = (itemKey?: string) => {
    switch (itemKey) {
      case DataAnalysisTabOptions.TableView:
        return TelemetryEventName.TableViewTabSelected;
      case DataAnalysisTabOptions.ChartView:
        return TelemetryEventName.DatasetExplorerTabSelected;
      case DataAnalysisTabOptions.DataBalance:
        return TelemetryEventName.DataBalanceTabSelected;
      default:
        return TelemetryEventName.DatasetExplorerTabSelected;
    }
  };
}

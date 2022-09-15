// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IPlotlyProperty, SelectionContext } from "@responsible-ai/mlchartlib";
import React from "react";

import { EbmExplanation } from "./Controls/EbmExplanation";
import { FeatureImportanceBar } from "./Controls/FeatureImportance/FeatureImportanceBar";
import {
  barId,
  IFeatureImportanceConfig,
  FeatureImportanceWrapper,
  globalFeatureImportanceId
} from "./Controls/FeatureImportance/FeatureImportanceWrapper";
import {
  DataExploration,
  dataScatterId
} from "./Controls/Scatter/DataExploration";
import {
  ExplanationExploration,
  explanationScatterId
} from "./Controls/Scatter/ExplanationExploration";
import { IDashboardContext } from "./ExplanationDashboard";
import { IStringsParam } from "./Interfaces/IStringsParam";
import { IBarChartConfig } from "./SharedComponents/IBarChartConfig";
interface IExplanationDashboardActiveTabsProps {
  activeGlobalTab: number;
  dashboardContext: IDashboardContext;
  theme: string;
  selectionContext: SelectionContext;
  selectedRow: number | undefined;
  configs: {
    [key: string]: IPlotlyProperty | IFeatureImportanceConfig | IBarChartConfig;
  };
  stringParams: IStringsParam | undefined;
  onConfigChanged: (
    newConfig: IPlotlyProperty | IFeatureImportanceConfig | IBarChartConfig,
    configId: string
  ) => void;
}
export class ExplanationDashboardActiveTabs extends React.Component<IExplanationDashboardActiveTabsProps> {
  public render(): React.ReactNode {
    return (
      <>
        {this.props.activeGlobalTab === 0 && (
          <DataExploration
            dashboardContext={this.props.dashboardContext}
            theme={this.props.theme}
            selectionContext={this.props.selectionContext}
            selectedRow={this.props.selectedRow}
            plotlyProps={this.props.configs[dataScatterId] as IPlotlyProperty}
            onChange={this.props.onConfigChanged}
            messages={
              this.props.stringParams
                ? this.props.stringParams.contextualHelp
                : undefined
            }
          />
        )}
        {this.props.activeGlobalTab === 1 && (
          <FeatureImportanceBar
            dashboardContext={this.props.dashboardContext}
            theme={this.props.theme as any}
            selectionContext={this.props.selectionContext}
            selectedRow={this.props.selectedRow}
            config={this.props.configs[barId] as IFeatureImportanceConfig}
            onChange={this.props.onConfigChanged}
            messages={
              this.props.stringParams
                ? this.props.stringParams.contextualHelp
                : undefined
            }
          />
        )}
        {this.props.activeGlobalTab === 2 && (
          <ExplanationExploration
            dashboardContext={this.props.dashboardContext}
            theme={this.props.theme as any}
            selectionContext={this.props.selectionContext}
            selectedRow={this.props.selectedRow}
            plotlyProps={
              this.props.configs[explanationScatterId] as IPlotlyProperty
            }
            onChange={this.props.onConfigChanged}
            messages={
              this.props.stringParams
                ? this.props.stringParams.contextualHelp
                : undefined
            }
          />
        )}
        {this.props.activeGlobalTab === 3 && (
          <FeatureImportanceWrapper
            dashboardContext={this.props.dashboardContext}
            theme={this.props.theme as any}
            selectionContext={this.props.selectionContext}
            selectedRow={this.props.selectedRow}
            config={
              this.props.configs[
                globalFeatureImportanceId
              ] as IFeatureImportanceConfig
            }
            onChange={this.props.onConfigChanged}
            messages={
              this.props.stringParams
                ? this.props.stringParams.contextualHelp
                : undefined
            }
          />
        )}
        {this.props.activeGlobalTab === 4 && (
          <EbmExplanation
            explanationContext={this.props.dashboardContext.explanationContext}
            theme={this.props.theme as any}
          />
        )}
        {this.props.activeGlobalTab === 5 && (
          <iframe
            title="custom"
            srcDoc={this.props.dashboardContext.explanationContext.customVis}
          />
        )}
      </>
    );
  }
}

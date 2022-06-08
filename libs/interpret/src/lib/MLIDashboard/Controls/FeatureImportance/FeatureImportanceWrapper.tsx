// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IComboBoxOption } from "@fluentui/react";
import { localization } from "@responsible-ai/localization";
import { SelectionContext } from "@responsible-ai/mlchartlib";
import React from "react";

import { IDashboardContext } from "../../ExplanationDashboard";
import { HelpMessageDict } from "../../Interfaces/IStringsParam";
import { IBarChartConfig } from "../../SharedComponents/IBarChartConfig";

import { Beehive } from "./Beehive";
import { FeatureImportanceBar } from "./FeatureImportanceBar";
import { FeatureImportanceModes } from "./FeatureImportanceModes";
import { Violin } from "./Violin";

export const barId = "bar_id";
export const globalFeatureImportanceId = "global_feature_id";

export interface IFeatureImportanceConfig extends IBarChartConfig {
  displayMode: FeatureImportanceModes;
  id: string;
}

export interface IGlobalFeatureImportanceProps {
  dashboardContext: IDashboardContext;
  config: IFeatureImportanceConfig;
  selectionContext: SelectionContext;
  selectedRow?: number;
  chartTypeOptions?: IComboBoxOption[];
  messages?: HelpMessageDict;
  theme?: string;
  onChange: (config: IFeatureImportanceConfig, id: string) => void;
}

export class FeatureImportanceWrapper extends React.PureComponent<IGlobalFeatureImportanceProps> {
  public render(): React.ReactNode {
    const chartTypeOptions: IComboBoxOption[] =
      this.props.dashboardContext.explanationContext.localExplanation !==
      undefined
        ? [
            {
              key: FeatureImportanceModes.Box,
              text: localization.Interpret.FeatureImportanceWrapper.boxText
            },
            {
              key: FeatureImportanceModes.Beehive,
              text: localization.Interpret.FeatureImportanceWrapper.beehiveText
            },
            {
              key: FeatureImportanceModes.Violin,
              text: localization.Interpret.FeatureImportanceWrapper.violinText
            }
          ]
        : [];

    switch (this.props.config.displayMode) {
      case FeatureImportanceModes.Bar:
        return (
          <FeatureImportanceBar
            {...this.props}
            chartTypeOptions={chartTypeOptions}
          />
        );
      case FeatureImportanceModes.Beehive:
        return <Beehive {...this.props} chartTypeOptions={chartTypeOptions} />;
      case FeatureImportanceModes.Violin:
      case FeatureImportanceModes.Box:
      default:
        return <Violin {...this.props} chartTypeOptions={chartTypeOptions} />;
    }
  }
}

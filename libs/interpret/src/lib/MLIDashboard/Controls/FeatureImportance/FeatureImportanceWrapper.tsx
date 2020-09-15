// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from "react";
import { SelectionContext } from "@responsible-ai/mlchartlib";
import { IComboBoxOption } from "office-ui-fabric-react";
import { IDashboardContext } from "../../ExplanationDashboard";
import { IBarChartConfig } from "../../SharedComponents/IBarChartConfig";
import { HelpMessageDict } from "../../Interfaces/IStringsParam";
import { localization } from "../../../Localization/localization";
import { FeatureImportanceBar } from "./FeatureImportanceBar";
import { Beehive } from "./Beehive";
import { Violin } from "./Violin";
import { FeatureImportanceModes } from "./FeatureImportanceModes";

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

export class FeatureImportanceWrapper extends React.PureComponent<
  IGlobalFeatureImportanceProps
> {
  public render(): React.ReactNode {
    const chartTypeOptions: IComboBoxOption[] =
      this.props.dashboardContext.explanationContext.localExplanation !==
      undefined
        ? [
            {
              text: localization.FeatureImportanceWrapper.boxText,
              key: FeatureImportanceModes.Box
            },
            {
              text: localization.FeatureImportanceWrapper.beehiveText,
              key: FeatureImportanceModes.Beehive
            },
            {
              text: localization.FeatureImportanceWrapper.violinText,
              key: FeatureImportanceModes.Violin
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

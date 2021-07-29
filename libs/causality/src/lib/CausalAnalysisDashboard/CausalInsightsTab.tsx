// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  defaultModelAssessmentContext,
  ICausalAnalysisData,
  ModelAssessmentContext
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import { Text, Pivot, PivotItem, Stack } from "office-ui-fabric-react";
import React from "react";

import { CausalAnalysisOptions } from "./CausalAnalysisEnums";
import { CausalAnalysisView } from "./Controls/CausalAnalysisView/CausalAnalysisView";

export interface ICausalInsightsTabProps {
  data: ICausalAnalysisData;
}

interface ICausalInsightsTabState {
  viewOption: string;
}
export class CausalInsightsTab extends React.PureComponent<
  ICausalInsightsTabProps,
  ICausalInsightsTabState
> {
  public static contextType = ModelAssessmentContext;
  public context: React.ContextType<typeof ModelAssessmentContext> =
    defaultModelAssessmentContext;

  public constructor(props: ICausalInsightsTabProps) {
    super(props);
    this.state = { viewOption: CausalAnalysisOptions.Aggregate };
  }

  public render(): React.ReactNode {
    return (
      <Stack grow tokens={{ padding: "16px 24px" }}>
        <Stack
          horizontal={false}
          tokens={{ childrenGap: "15px", padding: "0 0 0 8px" }}
        >
          <Text variant={"xLarge"}>
            {localization.ModelAssessment.ComponentNames.CausalAnalysis}
          </Text>
        </Stack>
        <Stack horizontal tokens={{ childrenGap: "10px" }}>
          <Pivot onLinkClick={this.onViewTypeChange}>
            <PivotItem
              itemKey={CausalAnalysisOptions.Aggregate}
              headerText={localization.CausalAnalysis.MainMenu.aggregate}
            />
            <PivotItem
              itemKey={CausalAnalysisOptions.Individual}
              headerText={localization.CausalAnalysis.MainMenu.individual}
            />
            <PivotItem
              itemKey={CausalAnalysisOptions.Treatment}
              headerText={localization.CausalAnalysis.MainMenu.treatment}
            />
          </Pivot>
        </Stack>
        <CausalAnalysisView
          viewOption={this.state.viewOption}
          data={this.props.data}
        />
      </Stack>
    );
  }
  private onViewTypeChange = (item?: PivotItem): void => {
    if (
      item &&
      item.props.itemKey &&
      item.props.itemKey !== this.state.viewOption
    ) {
      this.setState({
        viewOption: item.props.itemKey
      });
    }
  };
}

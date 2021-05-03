// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  defaultModelAssessmentContext,
  ICasualAnalysisData,
  ModelAssessmentContext
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import {
  Text,
  Pivot,
  PivotItem,
  Stack
} from "office-ui-fabric-react";
import React from "react";

import { CasualAnalysisOptions } from "./CasualAnalysisEnums";
import { CasualAnalysisView } from "./Controls/CasualAnalysisView/CasualAnalysisView";


export interface ICausalInsightsTabProps {
  data: ICasualAnalysisData;
}

interface ICausalInsightsTabState {
  viewOption: string
}
export class CausalInsightsTab extends React.PureComponent<ICausalInsightsTabProps, ICausalInsightsTabState> {
  public static contextType = ModelAssessmentContext;
  public context: React.ContextType<
    typeof ModelAssessmentContext
  > = defaultModelAssessmentContext;

  constructor(props: ICausalInsightsTabProps) {
    super(props);
    this.state = { viewOption: CasualAnalysisOptions.Aggregate };
  }

  public render(): React.ReactNode {
    return (
      <Stack grow={true} tokens={{ padding: "16px 24px" }}>
        <Stack horizontal={false} tokens={{ childrenGap: "15px" }}>
          <Text variant={"xLarge"}>
            {localization.CasualAnalysis.MainMenu.header}
          </Text>
        </Stack>
        <Stack horizontal={true} tokens={{ childrenGap: "10px" }}>
          <Pivot onLinkClick={this.onViewTypeChange}>
            <PivotItem
              itemKey={CasualAnalysisOptions.Aggregate}
              headerText={localization.CasualAnalysis.MainMenu.aggregate}
            />
            <PivotItem
              itemKey={CasualAnalysisOptions.Individual}
              headerText={localization.CasualAnalysis.MainMenu.individual}
            />
            <PivotItem
              itemKey={CasualAnalysisOptions.Treatment}
              headerText={localization.CasualAnalysis.MainMenu.treatment}
            />
          </Pivot>
        </Stack>
        <CasualAnalysisView viewOption={this.state.viewOption} data={this.props.data}/>
      </Stack>
    );
  }
  private onViewTypeChange = (
    item?: PivotItem,
    _ev?: React.MouseEvent<HTMLElement>
  ): void => {
    if (item && item.props.itemKey && item.props.itemKey !== this.state.viewOption) {
      this.setState({
        viewOption: item.props.itemKey
      });
    }
  };
}
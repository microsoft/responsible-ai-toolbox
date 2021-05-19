// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  defaultModelAssessmentContext,
  ICausalAnalysisData,
  ModelAssessmentContext
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import { Text, Stack } from "office-ui-fabric-react";
import React from "react";

import { CounterfactualsView } from "./CounterfactualsView";

export interface ICounterfactualsTabProps {
  data: ICausalAnalysisData;
}

export class CounterfactualsTab extends React.PureComponent<
  ICounterfactualsTabProps
> {
  public static contextType = ModelAssessmentContext;
  public context: React.ContextType<
    typeof ModelAssessmentContext
  > = defaultModelAssessmentContext;

  public render(): React.ReactNode {
    return (
      <Stack grow tokens={{ padding: "16px 24px" }}>
        <Stack horizontal={false} tokens={{ childrenGap: "15px" }}>
          <Text variant={"xLarge"}>{localization.Counterfactuals.header}</Text>
        </Stack>
        <CounterfactualsView data={this.props.data} />
      </Stack>
    );
  }
}

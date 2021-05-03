// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
    defaultModelAssessmentContext,
    ICasualAnalysisData,
    ModelAssessmentContext
  } from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import { Stack, Text } from "office-ui-fabric-react";
import React from "react";
  
  
export interface ICasualIndividualViewProps {
  data: ICasualAnalysisData;
}
  
export class CasualIndividualView extends React.PureComponent<ICasualIndividualViewProps> {
  public static contextType = ModelAssessmentContext;
  public context: React.ContextType<
    typeof ModelAssessmentContext
  > = defaultModelAssessmentContext;

  public render(): React.ReactNode {
      return (
          <Stack grow={true} tokens={{ padding: "16px 24px" }}>
            <Stack horizontal={false} tokens={{ childrenGap: "15px" }}>
              <Text variant={"medium"}>
                {localization.CasualAnalysis.AggregateView.description}
              </Text>
              <Text variant={"medium"}>
                {localization.CasualAnalysis.AggregateView.description}
              </Text>
            </Stack>
            <Stack horizontal={true} tokens={{ childrenGap: "10px" }}>

            </Stack>
          </Stack>
        );
  }
}
  
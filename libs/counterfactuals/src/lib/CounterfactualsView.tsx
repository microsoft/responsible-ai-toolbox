// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  defaultModelAssessmentContext,
  ICausalAnalysisData,
  ICausalAnalysisSingleData,
  ModelAssessmentContext
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import { Stack, Text } from "office-ui-fabric-react";
import React from "react";

export interface ICounterfactualsViewProps {
  data: ICausalAnalysisData;
}
interface ICounterfactualsViewState {
  selectedData?: ICausalAnalysisSingleData;
}

export class CounterfactualsView extends React.PureComponent<
  ICounterfactualsViewProps,
  ICounterfactualsViewState
> {
  public static contextType = ModelAssessmentContext;
  public context: React.ContextType<
    typeof ModelAssessmentContext
  > = defaultModelAssessmentContext;
  public constructor(props: ICounterfactualsViewProps) {
    super(props);
    this.state = {
      selectedData: undefined
    };
  }

  public render(): React.ReactNode {
    // const styles = CausalIndividualStyles();
    return (
      <Stack grow tokens={{ padding: "16px 24px" }}>
        <Stack.Item>
          <Text variant={"medium"}>
            {localization.CausalAnalysis.IndividualView.description}
          </Text>
        </Stack.Item>
        <Stack.Item>
          <div>Test</div>
        </Stack.Item>
      </Stack>
    );
  }
  //   private readonly handleOnClick = (dataIndex: number | undefined): void => {
  //     this.setState({
  //       selectedData: this.getDataFromIndex(dataIndex)
  //     });
  //   };
}

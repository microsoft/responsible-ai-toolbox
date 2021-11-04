// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  defaultModelAssessmentContext,
  ICounterfactualData,
  ModelAssessmentContext
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import { Text, Stack } from "office-ui-fabric-react";
import React from "react";

import { counterfactualsTabStyles } from "./CounterfactualsTab.styles";
import { CounterfactualsView } from "./CounterfactualsView";

export interface ICounterfactualsTabProps {
  data: ICounterfactualData;
}

export class CounterfactualsTab extends React.PureComponent<ICounterfactualsTabProps> {
  public static contextType = ModelAssessmentContext;
  public context: React.ContextType<typeof ModelAssessmentContext> =
    defaultModelAssessmentContext;

  public render(): React.ReactNode {
    const classNames = counterfactualsTabStyles();
    return (
      <Stack
        className={classNames.container}
        horizontal={false}
        tokens={{ childrenGap: "15px" }}
      >
        <Stack.Item>
          <Text variant={"xxLarge"}>{localization.Counterfactuals.header}</Text>
        </Stack.Item>
        <Stack.Item>
          <CounterfactualsView data={this.props.data} />
        </Stack.Item>
      </Stack>
    );
  }
}

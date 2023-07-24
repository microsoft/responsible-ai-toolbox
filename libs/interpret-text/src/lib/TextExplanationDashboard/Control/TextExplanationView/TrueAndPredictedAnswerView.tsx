// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Stack, Text } from "@fluentui/react";
import { localization } from "@responsible-ai/localization";
import React from "react";

import { textExplanationDashboardStyles } from "./TextExplanationView.styles";

interface ITrueAndPredictedAnswerViewProps {
  predictedY: string | number | number[] | string[] | number[][] | undefined;
  trueY: string | number | number[] | string[] | number[][] | undefined;
}

export class TrueAndPredictedAnswerView extends React.Component<ITrueAndPredictedAnswerViewProps> {
  public render(): React.ReactNode {
    const classNames = textExplanationDashboardStyles();

    return (
      <Stack horizontal={false}>
        <Stack horizontal>
          <Stack.Item>
            <Text className={classNames.predictedAnswer}>
              {localization.InterpretText.View.predictedAnswer} &nbsp;
            </Text>
          </Stack.Item>
          <Stack.Item>
            <Text className={classNames.predictedAnswer}>
              {this.props.predictedY}
            </Text>
          </Stack.Item>
        </Stack>
        <Stack horizontal>
          <Stack.Item>
            <Text className={classNames.boldText}>
              {localization.InterpretText.View.trueAnswer} &nbsp;
            </Text>
          </Stack.Item>
          <Stack.Item>
            <Text className={classNames.boldText}>{this.props.trueY}</Text>
          </Stack.Item>
        </Stack>
      </Stack>
    );
  }
}

// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Label, Text, Stack, IStackTokens } from "@fluentui/react";
import { localization } from "@responsible-ai/localization";
import React from "react";

import { textFeatureLegendStyles } from "./TextFeatureLegend.styles";

const componentStackTokens: IStackTokens = {
  childrenGap: "m",
  padding: "m"
};

const legendStackTokens: IStackTokens = {
  childrenGap: "m",
  padding: "s"
};

export class TextFeatureLegend extends React.Component {
  public render(): React.ReactNode {
    const classNames = textFeatureLegendStyles();
    return (
      <Stack id="TextFeatureLegend" tokens={componentStackTokens}>
        <Stack.Item>
          <Text variant={"large"} className={classNames.legend}>
            {localization.InterpretText.Legend.featureLegend}
          </Text>
        </Stack.Item>
        <Stack.Item>
          <Stack horizontal tokens={legendStackTokens}>
            <Stack.Item align="center">
              <Label className={classNames.posFeatureImportance}>A</Label>
            </Stack.Item>
            <Stack.Item align="center">
              <Text>
                {localization.InterpretText.Legend.posFeatureImportance}
              </Text>
            </Stack.Item>
          </Stack>
        </Stack.Item>
        <Stack.Item>
          <Stack horizontal tokens={legendStackTokens}>
            <Stack.Item align="center">
              <Label className={classNames.negFeatureImportance}>A</Label>
            </Stack.Item>
            <Stack.Item align="center">
              <Text>
                {localization.InterpretText.Legend.negFeatureImportance}
              </Text>
            </Stack.Item>
          </Stack>
        </Stack.Item>
      </Stack>
    );
  }
}

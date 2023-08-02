// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Stack, Text } from "@fluentui/react";
import { localization } from "@responsible-ai/localization";
import React from "react";

import { dataCharacteristicsStyles } from "./DataCharacteristics.styles";

export class DataCharacteristicsLegend extends React.Component {
  public render(): React.ReactNode {
    const classNames = dataCharacteristicsStyles();
    return (
      <Stack horizontal tokens={{ childrenGap: "l1" }} verticalAlign="center">
        <Stack.Item>
          <div
            className={classNames.successIndicator}
            style={{ height: 10, width: 75 }}
          />
        </Stack.Item>
        <Stack.Item>
          <Text variant="small">
            {localization.InterpretVision.Dashboard.titleBarSuccess}
          </Text>
        </Stack.Item>
        <Stack.Item>
          <div
            className={classNames.errorIndicator}
            style={{ height: 10, width: 75 }}
          />
        </Stack.Item>
        <Stack.Item>
          <Text variant="small">
            {localization.InterpretVision.Dashboard.titleBarError}
          </Text>
        </Stack.Item>
      </Stack>
    );
  }
}

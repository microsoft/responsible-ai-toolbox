// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Stack, Text } from "@fluentui/react";
import { localization } from "@responsible-ai/localization";
import React from "react";

import { dataCharacteristicsStyles } from "./DataCharacteristics.styles";

export interface IDataCharacteristicsHeaderProps {
  label: string;
  labelListLength: number;
  totalListLength: number;
}

export class DataCharacteristicsHeader extends React.Component<IDataCharacteristicsHeaderProps> {
  public render(): React.ReactNode {
    const classNames = dataCharacteristicsStyles();
    return (
      <Stack horizontal tokens={{ childrenGap: "l1" }} verticalAlign="center">
        <Stack.Item>
          <Text variant="xLarge">{this.props.label}</Text>
        </Stack.Item>
        <Stack.Item>
          <Text variant="medium">
            {this.props.labelListLength}/{this.props.totalListLength}{" "}
            {localization.InterpretVision.Dashboard.examples}
          </Text>
        </Stack.Item>
        <Stack.Item>
          <Stack horizontal className={classNames.progressBar}>
            <Stack.Item>
              <div
                className={classNames.progressBarForeground}
                style={{
                  width:
                    100 *
                    (this.props.labelListLength / this.props.totalListLength)
                }}
              />
            </Stack.Item>
            <Stack.Item>
              <div
                className={classNames.progressBarBackground}
                style={{
                  width:
                    100 -
                    100 *
                      (this.props.labelListLength / this.props.totalListLength)
                }}
              />
            </Stack.Item>
          </Stack>
        </Stack.Item>
      </Stack>
    );
  }
}

// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Stack, Text } from "@fluentui/react";
import { IVisionListItem } from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import React from "react";

import { stackTokens } from "./FlyoutObjectDetectionUtils";

interface IDetectionDetailsProps {
  item: IVisionListItem; // replace with actual type
  correctDetections: string;
  incorrectDetections: string;
}
export class DetectionDetails extends React.Component<IDetectionDetailsProps> {
  public render(): React.ReactNode {
    return (
      <Stack
        tokens={stackTokens.large}
        horizontalAlign="start"
        verticalAlign="start"
      >
        <Stack
          horizontal
          tokens={stackTokens.medium}
          horizontalAlign="center"
          verticalAlign="center"
        />
        <Stack.Item>
          <Text variant="large">
            {localization.InterpretVision.Dashboard.indexLabel}
            {this.props.item?.index}
          </Text>
        </Stack.Item>
        <Stack.Item>
          <Text variant="large">
            {localization.InterpretVision.Dashboard.correctDetections}
            {this.props.correctDetections}
          </Text>
        </Stack.Item>
        <Stack.Item>
          <Text variant="large">
            {localization.InterpretVision.Dashboard.incorrectDetections}
            {this.props.incorrectDetections}
          </Text>
        </Stack.Item>
      </Stack>
    );
  }
}

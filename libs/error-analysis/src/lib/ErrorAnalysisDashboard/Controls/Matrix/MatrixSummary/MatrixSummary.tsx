// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IStackTokens, Stack, Text } from "@fluentui/react";
import { localization } from "@responsible-ai/localization";
import React from "react";

import { matrixSummaryStyles } from "./MatrixSummary.styles";

const legendDescriptionPadding: IStackTokens = { padding: "20px 0px 20px 0px" };

export interface IMatrixSummaryProps {
  isEnabled: boolean;
}

export class MatrixSummary extends React.Component<IMatrixSummaryProps> {
  public render(): React.ReactNode {
    const classNames = matrixSummaryStyles();
    return (
      <Stack
        className={classNames.legendDescriptionStyle}
        tokens={legendDescriptionPadding}
      >
        <Text variant={"medium"}>
          {this.props.isEnabled
            ? localization.ErrorAnalysis.MatrixSummary.heatMapDescription
            : localization.ErrorAnalysis.MatrixSummary.heatMapStaticDescription}
        </Text>
      </Stack>
    );
  }
}

// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { localization } from "@responsible-ai/localization";
import { IStackTokens, Stack, Text } from "office-ui-fabric-react";
import React from "react";

import { matrixSummaryStyles } from "./MatrixSummary.styles";

const legendDescriptionPadding: IStackTokens = { padding: "20px 0px 20px 0px" };

export class MatrixSummary extends React.Component {
  public render(): React.ReactNode {
    const classNames = matrixSummaryStyles();
    return (
      <Stack
        className={classNames.legendDescriptionStyle}
        tokens={legendDescriptionPadding}
      >
        <Text variant={"smallPlus"}>
          {localization.ErrorAnalysis.MatrixSummary.heatMapDescription}
        </Text>
      </Stack>
    );
  }
}

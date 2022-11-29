// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Stack, Label, Text } from "@fluentui/react";
import { localization } from "@responsible-ai/localization";
import React from "react";

export interface IFeatureBalanceMeasuresDescriptionProps {
  selectedMeasure: string;
  selectedFeature: string;
  selectedLabel: string;
}

export class FeatureBalanceMeasuresDescription extends React.Component<IFeatureBalanceMeasuresDescriptionProps> {
  public render(): React.ReactNode {
    const measuresLocalization =
      localization.ModelAssessment.DataBalance.FeatureBalanceMeasures;

    return (
      <Stack horizontal verticalAlign="center" tokens={{ childrenGap: "4px" }}>
        <Text>{measuresLocalization.Description1}</Text>
        <Label>{this.props.selectedMeasure}</Label>
        <Text>{measuresLocalization.Description2}</Text>
        <Label>{this.props.selectedFeature}</Label>
        <Text>{measuresLocalization.Description3}</Text>
        <Label>{this.props.selectedLabel}</Label>
      </Stack>
    );
  }
}

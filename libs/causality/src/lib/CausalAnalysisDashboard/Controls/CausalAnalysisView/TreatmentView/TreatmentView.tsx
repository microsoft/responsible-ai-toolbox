// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ICausalPolicy } from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import { Stack, Text } from "office-ui-fabric-react";
import React from "react";

import { TreatmentBarChartSection } from "./TreatmentBarChartSection";
import { TreatmentListSection } from "./TreatmentListSection";
import { TreatmentStyles } from "./TreatmentStyles";
import { TreatmentTableSection } from "./TreatmentTableSection";

export interface ITreatmentViewProps {
  data?: ICausalPolicy;
}

export class TreatmentView extends React.PureComponent<ITreatmentViewProps> {
  public render(): React.ReactNode {
    const styles = TreatmentStyles();
    return (
      <Stack horizontal={false} grow tokens={{ padding: "16px 24px" }}>
        <Text variant={"medium"} className={styles.label}>
          {localization.Counterfactuals.treatmentDescription}
        </Text>
        <TreatmentTableSection data={this.props.data} />
        <TreatmentBarChartSection data={this.props.data} />
        <TreatmentListSection data={this.props.data} />
      </Stack>
    );
  }
}

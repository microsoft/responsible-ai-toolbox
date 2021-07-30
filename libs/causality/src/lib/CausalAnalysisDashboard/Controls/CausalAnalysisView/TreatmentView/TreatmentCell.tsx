// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  defaultModelAssessmentContext,
  ICausalPolicyTreeLeaf,
  ModelAssessmentContext
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import { Stack, Text } from "office-ui-fabric-react";
import React from "react";

import { TreatmentTableStyles } from "./TreatmentTableStyles";

export interface ITreatmentCellProps {
  data: ICausalPolicyTreeLeaf;
}

export class TreatmentCell extends React.PureComponent<ITreatmentCellProps> {
  public static contextType = ModelAssessmentContext;
  public context: React.ContextType<typeof ModelAssessmentContext> =
    defaultModelAssessmentContext;

  public render(): React.ReactNode {
    const styles = TreatmentTableStyles();
    return (
      <Stack
        horizontal={false}
        grow
        tokens={{ padding: "l1" }}
        className={styles.singleCell}
      >
        <Stack.Item>
          <Text>
            {localization.formatString(
              localization.CausalAnalysis.TreatmentPolicy.nSample,
              this.props.data.n_samples
            )}
          </Text>
        </Stack.Item>
        <Stack.Item>
          <Text>
            {localization.formatString(
              localization.CausalAnalysis.TreatmentPolicy.Recommended,
              this.props.data.treatment
            )}
          </Text>
        </Stack.Item>
      </Stack>
    );
  }
}

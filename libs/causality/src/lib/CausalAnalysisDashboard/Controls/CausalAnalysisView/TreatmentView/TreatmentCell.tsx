// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Stack, Text } from "@fluentui/react";
import {
  defaultModelAssessmentContext,
  ICausalPolicyTreeLeaf,
  ModelAssessmentContext
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import React from "react";

export interface ITreatmentCellProps {
  data: ICausalPolicyTreeLeaf;
  rowSpan: number;
  colSpan: number;
}

export class TreatmentCell extends React.PureComponent<ITreatmentCellProps> {
  public static contextType = ModelAssessmentContext;
  public context: React.ContextType<typeof ModelAssessmentContext> =
    defaultModelAssessmentContext;

  public render(): React.ReactNode {
    return (
      <td colSpan={this.props.colSpan} rowSpan={this.props.rowSpan}>
        <Stack horizontal={false} grow tokens={{ padding: "l1" }}>
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
      </td>
    );
  }
}

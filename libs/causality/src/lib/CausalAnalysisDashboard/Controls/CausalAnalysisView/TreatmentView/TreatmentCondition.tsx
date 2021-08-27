// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  ComparisonTypes,
  ICausalPolicyTreeInternal
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import React from "react";

export interface ITreatmentConditionProps {
  rowSpan?: number;
  colSpan?: number;
  comparisonType: ComparisonTypes | undefined;
  fieldName: string;
  comparisonValue: ICausalPolicyTreeInternal["comparison_value"];
}

export class TreatmentCondition extends React.Component<ITreatmentConditionProps> {
  public render(): React.ReactNode {
    return (
      <th rowSpan={this.props.rowSpan} colSpan={this.props.colSpan}>
        {localization.formatString(
          this.props.comparisonType
            ? localization.Core.ComparisonTypes[this.props.comparisonType]
            : localization.Core.ComparisonTypes.Unknown,
          this.props.fieldName,
          Array.isArray(this.props.comparisonValue)
            ? this.props.comparisonValue.join(",")
            : this.props.comparisonValue
        )}
      </th>
    );
  }
}

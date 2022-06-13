// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Spinner, SpinnerSize } from "@fluentui/react";
import { localization } from "@responsible-ai/localization";
import React from "react";

import { loadingSpinnerStyles } from "./LoadingSpinner.styles";

export class LoadingSpinner extends React.PureComponent {
  public render(): React.ReactNode {
    return (
      <Spinner
        className={loadingSpinnerStyles.explanationSpinner}
        size={SpinnerSize.large}
        label={localization.Interpret.BarChart.calculatingExplanation}
      />
    );
  }
}

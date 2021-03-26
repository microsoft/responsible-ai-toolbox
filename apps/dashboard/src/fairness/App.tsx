// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IFairnessData } from "@responsible-ai/core-ui";
import { FairnessWizardV2, IFairnessProps } from "@responsible-ai/fairness";
import { Language } from "@responsible-ai/localization";
import { ITheme } from "office-ui-fabric-react";
import React from "react";

import {
  generateRandomMetrics,
  messages,
  supportedBinaryClassificationPerformanceKeys,
  supportedProbabilityPerformanceKeys,
  supportedRegressionPerformanceKeys
} from "./utils";

interface IAppProps {
  dataset: IFairnessData;
  theme: ITheme;
  language: Language;
  version: 2;
}

export class App extends React.Component<IAppProps> {
  public render(): React.ReactNode {
    const dashboardProps: IFairnessProps = {
      ...this.props.dataset,
      locale: this.props.language,
      requestMetrics: generateRandomMetrics.bind(this),
      stringParams: { contextualHelp: messages },
      supportedBinaryClassificationPerformanceKeys,
      supportedProbabilityPerformanceKeys,
      supportedRegressionPerformanceKeys,
      theme: this.props.theme
    };
    switch (this.props.version) {
      // FairnessWizardV1 is no longer available - refer to branch
      // rolutz/branch_with_fairness_v1_and_interpret_v1 if needed
      case 2:
      default:
        return <FairnessWizardV2 {...dashboardProps} />;
    }
  }
}

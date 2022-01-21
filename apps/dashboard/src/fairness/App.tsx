// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ITheme } from "@fluentui/react";
import { IFairnessData } from "@responsible-ai/core-ui";
import { FairnessWizard, IFairnessProps } from "@responsible-ai/fairness";
import { Language } from "@responsible-ai/localization";
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
    return <FairnessWizard {...dashboardProps} />;
  }
}

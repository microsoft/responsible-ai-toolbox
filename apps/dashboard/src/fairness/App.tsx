// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  FairnessWizardV1,
  FairnessWizardV2,
  IMetricResponse,
  IMetricRequest,
  IFairnessData,
  IFairnessProps
} from "@responsible-ai/fairness";
import { ITheme } from "office-ui-fabric-react";
import React from "react";

interface IAppProps {
  dataset: IFairnessData;
  theme: ITheme;
  language: string;
  version: 1 | 2;
}

export class App extends React.Component<IAppProps> {
  private static supportedBinaryClassificationAccuracyKeys = [
    "accuracy_score",
    "balanced_accuracy_score",
    "precision_score",
    "recall_score",
    "f1_score"
  ];

  private static supportedRegressionAccuracyKeys = [
    "mean_absolute_error",
    "r2_score",
    "mean_squared_error",
    "root_mean_squared_error"
  ];

  private static supportedProbabilityAccuracyKeys = [
    "auc",
    "root_mean_squared_error",
    "balanced_root_mean_squared_error",
    "r2_score",
    "mean_squared_error",
    "mean_absolute_error"
  ];

  private static messages = {
    LocalExpAndTestReq: [{ displayText: "LocalExpAndTestReq" }],
    LocalOrGlobalAndTestReq: [{ displayText: "LocalOrGlobalAndTestReq" }],
    TestReq: [{ displayText: "TestReq" }],
    PredictorReq: [{ displayText: "PredictorReq" }]
  };

  public render(): React.ReactNode {
    const dashboardProps: IFairnessProps = {
      ...this.props.dataset,
      supportedBinaryClassificationAccuracyKeys:
        App.supportedBinaryClassificationAccuracyKeys,
      supportedRegressionAccuracyKeys: App.supportedRegressionAccuracyKeys,
      supportedProbabilityAccuracyKeys: App.supportedProbabilityAccuracyKeys,
      stringParams: { contextualHelp: App.messages },
      requestMetrics: this.generateRandomMetrics.bind(this),
      theme: this.props.theme,
      locale: this.props.language
    };
    switch (this.props.version) {
      case 1:
        return <FairnessWizardV1 {...dashboardProps} />;
      case 2:
      default:
        return <FairnessWizardV2 {...dashboardProps} />;
    }
  }

  private generateRandomMetrics(
    request: IMetricRequest,
    abortSignal?: AbortSignal
  ): Promise<IMetricResponse> {
    const binSize = Math.max(...request.binVector);
    const bins: number[] = new Array(binSize + 1)
      .fill(0)
      .map(() => Math.random());
    // bins[2] = undefined;
    const promise = new Promise<IMetricResponse>((resolve, reject) => {
      const timeout = setTimeout(() => {
        resolve({
          global: Math.random(),
          bins
        });
      }, 300);
      if (abortSignal) {
        abortSignal.addEventListener("abort", () => {
          clearTimeout(timeout);
          reject(new DOMException("Aborted", "AbortError"));
        });
      }
    });
    return promise;
  }
}

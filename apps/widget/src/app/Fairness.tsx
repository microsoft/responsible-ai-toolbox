// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { generateRoute } from "@responsible-ai/core-ui";
import {
  FairnessWizardV2,
  IMetricRequest,
  IMetricResponse
} from "@responsible-ai/fairness";
import React from "react";

import { IAppConfig } from "./IAppConfig";
import { IFairnessRouteProps, routeKey } from "./IFairnessRouteProps";

export interface IFairnessState {
  fairnessConfig: any | undefined;
}

export type IFairnessProps = IFairnessRouteProps & IAppConfig;
export class Fairness extends React.Component<IFairnessProps, IFairnessState> {
  public static route = `/fairness/model${generateRoute(routeKey)}`;
  private static supportedBinaryClassificationParityKeys = [
    "accuracy_score_difference",
    "accuracy_score_min",
    "accuracy_score_ratio",
    "balanced_accuracy_min",
    "demographic_parity_difference",
    "demographic_parity_ratio",
    "equalized_odds_difference",
    "equalized_odds_ratio",
    "error_rate_difference_binary_classification",
    "error_rate_ratio_binary_classification",
    "f1_score_min",
    "false_negative_rate_difference",
    "false_negative_rate_ratio",
    "false_positive_rate_difference",
    "false_positive_rate_ratio",
    "precision_score_min",
    "recall_score_min",
    "true_positive_rate_difference",
    "true_positive_rate_ratio",
    "true_negative_rate_difference",
    "true_negative_rate_ratio"
  ];

  private static supportedRegressionParityKeys = [
    "mean_absolute_error_max",
    "mean_squared_error_max",
    "r2_score_min"
  ];

  private static supportedProbabilityParityKeys = [
    "roc_auc_score_min",
    "log_loss_max",
    "mean_squared_error_max"
  ];
  public async componentDidMount(): Promise<void> {
    const res = await (
      await fetch(new Request(`/fairness/getmodel/${this.props.model}`))
    ).json();
    this.setState({ fairnessConfig: res });
  }
  public render(): React.ReactNode {
    if (this.state?.fairnessConfig) {
      return (
        <FairnessWizardV2
          dataSummary={{
            classNames: this.state.fairnessConfig.classes,
            featureNames: this.state.fairnessConfig.features
          }}
          testData={this.state.fairnessConfig.dataset}
          predictedY={this.state.fairnessConfig.predicted_ys}
          trueY={this.state.fairnessConfig.true_y}
          modelNames={this.state.fairnessConfig.model_names}
          precomputedMetrics={this.state.fairnessConfig.precomputedMetrics}
          precomputedFeatureBins={
            this.state.fairnessConfig.precomputedFeatureBins
          }
          customMetrics={this.state.fairnessConfig.customMetrics}
          predictionType={this.state.fairnessConfig.predictionType}
          supportedBinaryClassificationPerformanceKeys={
            this.state.fairnessConfig.classification_methods
          }
          supportedRegressionPerformanceKeys={
            this.state.fairnessConfig.regression_methods
          }
          supportedProbabilityPerformanceKeys={
            this.state.fairnessConfig.probability_methods
          }
          supportedBinaryClassificationParityKeys={
            Fairness.supportedBinaryClassificationParityKeys
          }
          supportedProbabilityParityKeys={
            Fairness.supportedProbabilityParityKeys
          }
          supportedRegressionParityKeys={Fairness.supportedRegressionParityKeys}
          locale={this.state.fairnessConfig.locale}
          requestMetrics={this.requestMetrics}
        />
      );
    }
    return "Loading";
  }

  private readonly requestMetrics = (
    postData: IMetricRequest
  ): Promise<IMetricResponse> => {
    return fetch(this.state.fairnessConfig.metricsUrl, {
      body: JSON.stringify(postData),
      headers: {
        "Content-Type": "application/json"
      },
      method: "post"
    })
      .then((resp) => {
        if (resp.status >= 200 && resp.status < 300) {
          return resp.json();
        }
        return Promise.reject(new Error(resp.statusText));
      })
      .then((json) => {
        if (json.error !== undefined) {
          throw new Error(json.error);
        }
        return Promise.resolve(json.data);
      });
  };
}

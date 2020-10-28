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

// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IMetricRequest, IMetricResponse } from "@responsible-ai/core-ui";
import { FairnessWizard } from "@responsible-ai/fairness";
import React from "react";

import { callFlaskService } from "./callFlaskService";
import { IAppConfig } from "./config";

interface IFairnessProps {
  config: IAppConfig;
  modelData: any;
}
export class Fairness extends React.Component<IFairnessProps> {
  public render(): React.ReactNode {
    let requestMethod = undefined;
    if (this.props.config.baseUrl) {
      requestMethod = async (
        data: IMetricRequest
      ): Promise<IMetricResponse> => {
        return callFlaskService(
          this.props.config,
          data,
          "/metrics"
        ) as Promise<IMetricResponse>;
      };
    }

    return (
      <FairnessWizard
        dataSummary={{
          classNames: this.props.modelData.classes,
          featureNames: this.props.modelData.features
        }}
        errorBarsEnabled={this.props.modelData.errorBarsEnabled}
        testData={this.props.modelData.dataset}
        predictedY={this.props.modelData.predicted_ys}
        trueY={this.props.modelData.true_y}
        modelNames={this.props.modelData.model_names}
        precomputedMetrics={this.props.modelData.precomputedMetrics}
        precomputedFeatureBins={this.props.modelData.precomputedFeatureBins}
        customMetrics={this.props.modelData.customMetrics}
        predictionType={this.props.modelData.predictionType}
        supportedBinaryClassificationPerformanceKeys={
          this.props.modelData.classification_methods
        }
        supportedRegressionPerformanceKeys={
          this.props.modelData.regression_methods
        }
        supportedProbabilityPerformanceKeys={
          this.props.modelData.probability_methods
        }
        locale={this.props.config.locale}
        requestMetrics={requestMethod}
      />
    );
  }
}

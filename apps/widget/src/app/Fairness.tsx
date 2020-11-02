// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  FairnessWizardV2,
  IMetricRequest,
  IMetricResponse
} from "@responsible-ai/fairness";
import React from "react";

import { config } from "./config";
import { modelData } from "./modelData";

export interface IFairnessState {
  fairnessConfig: any | undefined;
}

export class Fairness extends React.Component {
  public render(): React.ReactNode {
    return (
      <FairnessWizardV2
        dataSummary={{
          classNames: modelData.classes,
          featureNames: modelData.features
        }}
        testData={modelData.dataset}
        predictedY={modelData.predicted_ys}
        trueY={modelData.true_y}
        modelNames={modelData.model_names}
        precomputedMetrics={modelData.precomputedMetrics}
        precomputedFeatureBins={modelData.precomputedFeatureBins}
        customMetrics={modelData.customMetrics}
        predictionType={modelData.predictionType}
        supportedBinaryClassificationPerformanceKeys={
          modelData.classification_methods
        }
        supportedRegressionPerformanceKeys={modelData.regression_methods}
        supportedProbabilityPerformanceKeys={modelData.probability_methods}
        locale={modelData.locale}
        requestMetrics={
          modelData.hasMetricCallback ? this.requestMetrics : undefined
        }
      />
    );
  }

  private readonly requestMetrics = (
    postData: IMetricRequest
  ): Promise<IMetricResponse> => {
    return fetch(config.baseUrl + `/fairness/model/${config.id}/metrics`, {
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

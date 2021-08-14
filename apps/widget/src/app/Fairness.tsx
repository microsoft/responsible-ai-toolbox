// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IMetricRequest, IMetricResponse } from "@responsible-ai/core-ui";
import { FairnessWizardV2 } from "@responsible-ai/fairness";
import React from "react";

import { callFlaskService } from "./callFlaskService";
import { config } from "./config";
import { modelData } from "./modelData";

export class Fairness extends React.Component {
  public render(): React.ReactNode {
    let requestMethod = undefined;
    if (config.baseUrl !== undefined) {
      requestMethod = async (
        data: IMetricRequest
      ): Promise<IMetricResponse> => {
        return callFlaskService(data, "/metrics") as Promise<IMetricResponse>;
      };
    }

    return (
      <FairnessWizardV2
        dataSummary={{
          classNames: modelData.classes,
          featureNames: modelData.features
        }}
        errorBarsEnabled={modelData.errorBarsEnabled}
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
        locale={config.locale}
        requestMetrics={requestMethod}
      />
    );
  }
}

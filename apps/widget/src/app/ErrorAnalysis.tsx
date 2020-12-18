// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ErrorAnalysisDashboard } from "@responsible-ai/error-analysis";
import React from "react";

import { config } from "./config";
import { modelData } from "./modelData";

export class ErrorAnalysis extends React.Component {
  public render(): React.ReactNode {
    return (
      <ErrorAnalysisDashboard
        modelInformation={{ modelClass: "blackbox" }}
        dataSummary={{
          categoricalMap: modelData.categoricalMap,
          classNames: modelData.classNames,
          featureNames: modelData.featureNames
        }}
        testData={modelData.trainingData}
        predictedY={modelData.predictedY}
        probabilityY={modelData.probabilityY}
        trueY={modelData.trueY}
        precomputedExplanations={{
          ebmGlobalExplanation: modelData.ebmData,
          globalFeatureImportance: modelData.globalExplanation,
          localFeatureImportance: modelData.localExplanations
        }}
        requestPredictions={
          config.baseUrl !== undefined ? this.generatePrediction : undefined
        }
        requestDebugML={
          config.baseUrl !== undefined ? this.generateDebugML : undefined
        }
        requestMatrix={
          config.baseUrl !== undefined ? this.generateMatrix : undefined
        }
        localUrl={modelData.localUrl}
        locale={modelData.locale}
        features={modelData.featureNames}
      />
    );
  }

  private readonly generatePrediction = async (
    postData: any[]
  ): Promise<any[]> => {
    const predictUrl = config.baseUrl + "/predict";
    return fetch(predictUrl, {
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

  private readonly generateDebugML = async (
    postData: any[]
  ): Promise<any[]> => {
    const treeUrl = config.baseUrl + "/tree";
    return fetch(treeUrl, {
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

  private readonly generateMatrix = async (postData: any[]): Promise<any[]> => {
    const matrixUrl = config.baseUrl + "/matrix";
    return fetch(matrixUrl, {
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

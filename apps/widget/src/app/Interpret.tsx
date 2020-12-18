// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { NewExplanationDashboard } from "@responsible-ai/interpret";
import axios from "axios";
import React from "react";

import { config } from "./config";
import { modelData } from "./modelData";
interface IInterpretProps {
  dashboardType?: "ModelPerformance";
}
export class Interpret extends React.Component<IInterpretProps> {
  public render(): React.ReactNode {
    return (
      <NewExplanationDashboard
        dashboardType={this.props.dashboardType}
        modelInformation={{ modelClass: "blackbox" }}
        dataSummary={{
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
        locale={modelData.locale}
        explanationMethod={modelData.explanation_method}
      />
    );
  }

  private readonly generatePrediction = async (
    postData: any[]
  ): Promise<any[]> => {
    const predictUrl = config.baseUrl + "/predict";
    if (config.withCredentials) {
      const headers = {
        Accept:
          "application/json,text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
        "Content-Type": "application/json"
      };
      axios.defaults.withCredentials = true;
      const axiosOptions = { headers, withCredentials: true };
      return axios
        .post(predictUrl, JSON.stringify(postData), axiosOptions)
        .then((response) => {
          return response.data.data;
        })
        .catch(function (error) {
          throw new Error(error);
        });
    }
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
}

// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IModelAssessmentDashboardData,
  IDatasetSummary
} from "@responsible-ai/core-ui";
import { HelpMessageDict } from "@responsible-ai/error-analysis";
import { IFairnessProps } from "@responsible-ai/fairness";
import { Language } from "@responsible-ai/localization";
import {
  ModelAssessmentDashboard,
  IModelAssessmentDashboardProps
} from "@responsible-ai/model-assessment";
import _ from "lodash";
import { ITheme } from "office-ui-fabric-react";
import React from "react";
import {
  generateJsonTreeAdultCensusIncome,
  generateJsonMatrix,
  generateFeatures,
  generateJsonTreeBreastCancer,
  createJsonImportancesGenerator,
  createPredictionsRequestGenerator
} from "../error-analysis/utils";
import {
  generateRandomMetrics,
  messages,
  supportedBinaryClassificationPerformanceKeys,
  supportedProbabilityPerformanceKeys,
  supportedRegressionPerformanceKeys
} from "../fairness/utils";

interface IAppProps {
  modelAssessmentData: IModelAssessmentDashboardData;
  theme: ITheme;
  language: Language;
  version: 1;
  classDimension?: 1 | 2 | 3;
}

export class App extends React.Component<IAppProps> {
  private messages: HelpMessageDict = {
    LocalExpAndTestReq: [{ displayText: "LocalExpAndTestReq", format: "text" }],
    LocalOrGlobalAndTestReq: [
      { displayText: "LocalOrGlobalAndTestReq", format: "text" }
    ],
    PredictorReq: [{ displayText: "PredictorReq", format: "text" }],
    TestReq: [{ displayText: "TestReq", format: "text" }]
  };

  public render(): React.ReactNode {
    const fairnessProps: IFairnessProps = {
      trueY: this.props.modelAssessmentData.dataset.trueY,
      predictedY: [this.props.modelAssessmentData.modelExplanationData.predictedY!],
      testData: this.props.modelAssessmentData.dataset.sensitiveFeatures!,
      dataSummary: {featureNames: this.props.modelAssessmentData.dataset.sensitiveFeatureNames},
      locale: this.props.language,
      requestMetrics: generateRandomMetrics.bind(this),
      stringParams: { contextualHelp: messages },
      supportedBinaryClassificationPerformanceKeys: supportedBinaryClassificationPerformanceKeys,
      supportedProbabilityPerformanceKeys: supportedProbabilityPerformanceKeys,
      supportedRegressionPerformanceKeys: supportedRegressionPerformanceKeys,
      theme: this.props.theme
    };

    const datasetSummary: IDatasetSummary = {
      featureNames: this.props.modelAssessmentData.dataset.featureNames,
      classNames: this.props.modelAssessmentData.dataset.classNames,
      categoricalMap: this.props.modelAssessmentData.dataset.categoricalMap
    }

    if ("categoricalMap" in datasetSummary) {
      return (
        <ModelAssessmentDashboard
          modelInformation={{ modelClass: "blackbox" }}
          dataSummary={datasetSummary}
          testData={this.props.modelAssessmentData.dataset.features}
          predictedY={this.props.modelAssessmentData.modelExplanationData.predictedY as any}
          probabilityY={this.props.modelAssessmentData.modelExplanationData.probabilityY}
          trueY={this.props.modelAssessmentData.dataset.trueY as any}
          precomputedExplanations={{
            localFeatureImportance: this.props.modelAssessmentData.modelExplanationData.localExplanations
          }}
          fairness={fairnessProps}
          requestPredictions={
            !this.props.classDimension
              ? undefined
              : createPredictionsRequestGenerator(this.props.classDimension)
          }
          requestDebugML={generateJsonTreeAdultCensusIncome}
          requestMatrix={generateJsonMatrix}
          requestImportances={createJsonImportancesGenerator(
            this.props.modelAssessmentData.dataset.featureNames!,
            false
          )}
          localUrl={""}
          locale={undefined}
          features={this.props.modelAssessmentData.dataset.featureNames!}
        />
      );
    }
    const dashboardProp: IModelAssessmentDashboardProps = {
      modelInformation: { modelClass: "blackbox" },
      dataSummary: datasetSummary,
      fairness: fairnessProps,
      explanationMethod: "mimic",
      features: generateFeatures(),
      locale: this.props.language,
      localUrl: "https://www.bing.com/",
      requestDebugML: generateJsonTreeBreastCancer,
      requestImportances: createJsonImportancesGenerator(
        this.props.modelAssessmentData.dataset.featureNames!,
        true
      ),
      requestMatrix: generateJsonMatrix,
      requestPredictions: !this.props.classDimension
        ? undefined
        : createPredictionsRequestGenerator(this.props.classDimension),
      stringParams: { contextualHelp: this.messages },
      theme: this.props.theme
    };
    return <ModelAssessmentDashboard {...dashboardProp} />;
  }
}

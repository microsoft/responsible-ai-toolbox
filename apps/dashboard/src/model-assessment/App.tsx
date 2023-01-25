// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ITheme, MessageBar, Stack, Text } from "@fluentui/react";
import { ICausalWhatIfData, Metrics } from "@responsible-ai/core-ui";
import { HelpMessageDict } from "@responsible-ai/error-analysis";
import { Language } from "@responsible-ai/localization";
import {
  ModelAssessmentDashboard,
  IModelAssessmentDashboardProps,
  IModelAssessmentData
} from "@responsible-ai/model-assessment";
import React from "react";

import {
  generateJsonMatrix,
  createJsonImportancesGenerator,
  createPredictionsRequestGenerator,
  DatasetName,
  generateJsonTreeBoston,
  generateJsonTreeAdultCensusIncome,
  generateJsonTreeWine,
  getJsonMatrix,
  getJsonTreeAdultCensusIncome,
  getJsonTreeBoston,
  getJsonTreeWine
} from "../error-analysis/utils";

import ModelWorker from "./Model.worker";
import { ModelWorkerMessageType } from "./ModelWorkerMessageTypes";

interface IAppProps extends IModelAssessmentData {
  theme: ITheme;
  language: Language;
  version: 1 | 2;
  classDimension?: 1 | 2 | 3;
  featureFlights?: string[];
}

interface IAppState {
  requestPredictions?: (
    request: any[],
    abortSignal: AbortSignal
  ) => Promise<any[]>;
  messages: string[];
  modelReady: boolean;
}

export class App extends React.Component<IAppProps, IAppState> {
  private messages: HelpMessageDict = {
    LocalExpAndTestReq: [{ displayText: "LocalExpAndTestReq", format: "text" }],
    LocalOrGlobalAndTestReq: [
      { displayText: "LocalOrGlobalAndTestReq", format: "text" }
    ],
    PredictorReq: [{ displayText: "PredictorReq", format: "text" }],
    TestReq: [{ displayText: "TestReq", format: "text" }]
  };
  private worker: ModelWorker | undefined;
  private requestPredictionPromise: Map<number, (value: any[]) => void>;
  private requestPredictionPromiseId: number;
  public constructor(props: IAppProps) {
    super(props);
    this.state = { messages: [], modelReady: false };
    this.requestPredictionPromise = new Map();
    this.requestPredictionPromiseId = 0;
  }

  public componentDidMount(): void {
    this.loadPython();
  }

  public render(): React.ReactNode {
    if (this.props.modelExplanationData) {
      for (const exp of this.props.modelExplanationData) {
        exp.modelClass = "blackbox";
      }
    }
    let modelAssessmentDashboardProps: IModelAssessmentDashboardProps;
    if (this.props.version === 1) {
      modelAssessmentDashboardProps = {
        ...this.props,
        locale: this.props.language,
        localUrl: "https://www.bing.com/",
        requestCausalWhatIf: this.requestCausalWhatIf,
        requestMatrix: generateJsonMatrix(DatasetName.BreastCancer),
        requestPredictions: this.state.modelReady
          ? this.requestPrediction
          : createPredictionsRequestGenerator(this.props.classDimension),
        stringParams: { contextualHelp: this.messages },
        theme: this.props.theme
      };

      if (this.props.classDimension === 1) {
        // Boston
        modelAssessmentDashboardProps.requestDebugML = generateJsonTreeBoston;
        modelAssessmentDashboardProps.requestImportances =
          createJsonImportancesGenerator(
            this.props.dataset.feature_names,
            DatasetName.Boston
          );
      } else if (this.props.classDimension === 2) {
        // Adult
        modelAssessmentDashboardProps.requestDebugML =
          generateJsonTreeAdultCensusIncome;
        modelAssessmentDashboardProps.requestImportances =
          createJsonImportancesGenerator(
            this.props.dataset.feature_names,
            DatasetName.AdultCensusIncome
          );
      } else {
        // Wine
        modelAssessmentDashboardProps.requestDebugML = generateJsonTreeWine;
        modelAssessmentDashboardProps.requestImportances =
          createJsonImportancesGenerator(
            this.props.dataset.feature_names,
            DatasetName.Wine
          );
      }
    } else {
      let staticTree = getJsonTreeAdultCensusIncome(
        this.props.dataset.feature_names
      );
      if (this.props.classDimension === 1) {
        // Boston
        staticTree = getJsonTreeBoston(this.props.dataset.feature_names);
      } else if (this.props.classDimension !== 2) {
        // Wine
        staticTree = getJsonTreeWine(this.props.dataset.feature_names);
      }
      const staticMatrix = getJsonMatrix();
      modelAssessmentDashboardProps = {
        ...this.props,
        errorAnalysisData: [
          {
            matrix: staticMatrix.data,
            matrix_features: staticMatrix.features,
            maxDepth: 3,
            metric: Metrics.ErrorRate,
            minChildSamples: 21,
            numLeaves: 31,
            tree: staticTree.data,
            tree_features: staticTree.features
          }
        ],
        featureFlights: this.props.featureFlights,
        locale: this.props.language,
        localUrl: "https://www.bing.com/",
        stringParams: { contextualHelp: this.messages },
        theme: this.props.theme
      };
    }

    return (
      <Stack>
        <MessageBar>
          <Stack>
            {this.state.messages.map((m, i) => (
              <Text key={i}>{m}</Text>
            ))}
          </Stack>
        </MessageBar>
        <ModelAssessmentDashboard {...modelAssessmentDashboardProps} />
      </Stack>
    );
  }

  private workerCallback = (mess: MessageEvent): void => {
    const { type, message } = mess.data;
    if (message) {
      this.setState((prev) => ({
        messages: [...prev.messages, message]
      }));
    }
    if (type === ModelWorkerMessageType.Message) {
      return;
    }
    if (type === ModelWorkerMessageType.Ready) {
      this.setState({
        modelReady: true
      });
    }
    if (type === ModelWorkerMessageType.Predict) {
      const { id, data } = mess.data;
      const resolver = this.requestPredictionPromise.get(id);
      this.requestPredictionPromise.delete(id);
      resolver?.(JSON.parse(data));
    }
  };

  private async loadPython(): Promise<void> {
    this.worker = new ModelWorker();
    this.worker.addEventListener("message", this.workerCallback);
    this.worker.postMessage({
      featureNames: this.props.dataset.feature_names,
      features: this.props.dataset.features,
      taskType: this.props.dataset.task_type,
      trueY: this.props.dataset.true_y,
      type: ModelWorkerMessageType.Init
    });
  }

  private requestPrediction = (data: any[]): Promise<any[]> => {
    return new Promise((resolver) => {
      const id = this.requestPredictionPromiseId++;
      this.requestPredictionPromise.set(id, resolver);
      this.worker?.postMessage({
        data,
        id,
        type: ModelWorkerMessageType.Predict
      });
    });
  };

  private readonly requestCausalWhatIf = async (
    _id: string,
    _features: unknown[],
    _featureName: string,
    newValue: unknown[],
    _y: unknown[],
    abortSignal: AbortSignal
  ): Promise<ICausalWhatIfData[]> => {
    return new Promise<ICausalWhatIfData[]>((resolver) => {
      setTimeout(() => {
        if (abortSignal.aborted) {
          return;
        }
        resolver(
          newValue.map((target) => ({
            ci_lower: target as number,
            ci_upper: target as number,
            point_estimate: target as number,
            pvalue: 0,
            stderr: 0,
            zstat: undefined
          }))
        );
      }, 500);
    });
  };
}

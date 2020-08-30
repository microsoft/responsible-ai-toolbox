import React from "react";
import {
  FairnessWizardV1,
  FairnessWizardV2,
  IMetricResponse
} from "@responsible-ai/fairlearn";
import { createTheme } from "office-ui-fabric-react";
import _ from "lodash";
import { binaryClassifier } from "./__mock-data/binaryClassifier";
import { regression } from "./__mock-data/regression";
import { precomputedBinary } from "./__mock-data/precomputedBinary";
import { precomputedBinaryTwo } from "./__mock-data/precomputedBinaryTwo";
import { probit } from "./__mock-data/probit";

const darkTheme = createTheme({
  palette: {
    themePrimary: "#2899f5",
    themeLighterAlt: "#f6fbff",
    themeLighter: "#dbeefd",
    themeLight: "#bcdffc",
    themeTertiary: "#7bc0f9",
    themeSecondary: "#40a4f6",
    themeDarkAlt: "#2389dc",
    themeDark: "#1e74ba",
    themeDarker: "#165589",
    neutralLighterAlt: "#1c1c1c",
    neutralLighter: "#252525",
    neutralLight: "#343434",
    neutralQuaternaryAlt: "#3d3d3d",
    neutralQuaternary: "#454545",
    neutralTertiaryAlt: "#656565",
    neutralTertiary: "#c8c8c8",
    neutralSecondary: "#d0d0d0",
    neutralPrimaryAlt: "#dadada",
    neutralPrimary: "#ffffff",
    neutralDark: "#f4f4f4",
    black: "#f8f8f8",
    white: "#121212"
  }
});

const lightTheme = createTheme({
  palette: {
    themePrimary: "#0078d4",
    themeLighterAlt: "#eff6fc",
    themeLighter: "#deecf9",
    themeLight: "#c7e0f4",
    themeTertiary: "#71afe5",
    themeSecondary: "#2b88d8",
    themeDarkAlt: "#106ebe",
    themeDark: "#005a9e",
    themeDarker: "#004578",
    neutralLighterAlt: "#faf9f8",
    neutralLighter: "#f3f2f1",
    neutralLight: "#edebe9",
    neutralQuaternaryAlt: "#e1dfdd",
    neutralQuaternary: "#d0d0d0",
    neutralTertiaryAlt: "#c8c6c4",
    neutralTertiary: "#a19f9d",
    neutralSecondary: "#605e5c",
    neutralPrimaryAlt: "#3b3a39",
    neutralPrimary: "#323130",
    neutralDark: "#201f1e",
    black: "#000000",
    white: "#ffffff"
  }
});

const darkContrastTheme = createTheme({
  palette: {
    themePrimary: "#ffff00",
    themeLighterAlt: "#fffff5",
    themeLighter: "#ffffd6",
    themeLight: "#ffffb3",
    themeTertiary: "#ffff66",
    themeSecondary: "#ffff1f",
    themeDarkAlt: "#e6e600",
    themeDark: "#c2c200",
    themeDarker: "#8f8f00",
    neutralLighterAlt: "#1c1c1c",
    neutralLighter: "#252525",
    neutralLight: "#343434",
    neutralQuaternaryAlt: "#3d3d3d",
    neutralQuaternary: "#454545",
    neutralTertiaryAlt: "#656565",
    neutralTertiary: "#c8c8c8",
    neutralSecondary: "#d0d0d0",
    neutralPrimaryAlt: "#dadada",
    neutralPrimary: "#ffffff",
    neutralDark: "#f4f4f4",
    black: "#f8f8f8",
    white: "#000000"
  }
});

export class App extends React.Component<any, any> {
  private static choices = [
    { label: "binaryClassifier", data: binaryClassifier },
    { label: "regression", data: regression },
    { label: "probit", data: probit },
    { label: "precomputed binary", data: precomputedBinary },
    { label: "precomputed binary2", data: precomputedBinaryTwo }
  ];

  private static themeChoices = [
    { label: "light", data: lightTheme },
    { label: "dark", data: darkTheme },
    { label: "darkHiContrast", data: darkContrastTheme }
  ];

  private static versionChoices = [
    { label: "Version 1", data: "v1" },
    { label: "Version 2", data: "v2" }
  ];

  private static languages = [
    { label: "english", val: "en-EN" },
    { label: "spanish", val: "es-ES" },
    { label: "german", val: "de-DE" },
    { label: "chinese-s", val: "zh-CN" },
    { label: "japanese", val: "ja-JP" }
  ];

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

  public state: {
    value: number;
    themeIndex: number;
    language: string;
    versionIndex: number;
  };

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  public constructor(props: any) {
    super(props);
    this.state = {
      value: 0,
      themeIndex: 0,
      language: App.languages[0].val,
      versionIndex: 1
    };
  }

  public render(): React.ReactNode {
    const data: any = _.cloneDeep(App.choices[this.state.value].data);
    const theme = App.themeChoices[this.state.themeIndex].data;
    const version: string = App.versionChoices[this.state.versionIndex].data;
    return (
      <div style={{ backgroundColor: "grey", height: "100%" }}>
        <label>Select dataset:</label>
        <select
          id="datasetSelector"
          value={this.state.value}
          onChange={this.handleChange}
        >
          {App.choices.map((item, index) => (
            <option key={item.label} value={index}>
              {item.label}
            </option>
          ))}
        </select>
        <label>Select theme:</label>
        <select value={this.state.themeIndex} onChange={this.handleThemeChange}>
          {App.themeChoices.map((item, index) => (
            <option key={item.label} value={index}>
              {item.label}
            </option>
          ))}
        </select>
        <label>Select language:</label>
        <select
          value={this.state.language}
          onChange={this.handleLanguageChange}
        >
          {App.languages.map((item) => (
            <option key={item.val} value={item.val}>
              {item.label}
            </option>
          ))}
        </select>
        <label>Select version:</label>
        <select
          id="versionSelector"
          value={this.state.versionIndex}
          onChange={this.handleVersionChange}
        >
          {App.versionChoices.map((item, index) => (
            <option key={item.label} value={index}>
              {item.label}
            </option>
          ))}
        </select>
        <div
          style={{
            width: "80vw",
            backgroundColor: "white",
            margin: "50px auto"
          }}
        >
          <div style={{ width: "940px" }}>
            {version === "v1" && (
              <FairnessWizardV1
                dataSummary={{
                  featureNames: data.featureNames,
                  classNames: data.classNames
                }}
                testData={data.testData}
                predictedY={data.predictedY}
                trueY={data.trueY}
                precomputedMetrics={data.precomputedMetrics}
                precomputedFeatureBins={data.precomputedFeatureBins}
                customMetrics={data.customMetrics}
                predictionType={data.predictionType}
                supportedBinaryClassificationAccuracyKeys={
                  App.supportedBinaryClassificationAccuracyKeys
                }
                supportedRegressionAccuracyKeys={
                  App.supportedRegressionAccuracyKeys
                }
                supportedProbabilityAccuracyKeys={
                  App.supportedProbabilityAccuracyKeys
                }
                stringParams={{ contextualHelp: App.messages }}
                requestMetrics={this.generateRandomMetrics.bind(this)}
                theme={theme}
                locale={this.state.language}
                key={Date.now()}
              />
            )}
            {version === "v2" && (
              <FairnessWizardV2
                dataSummary={{
                  featureNames: data.featureNames,
                  classNames: data.classNames
                }}
                testData={data.testData}
                predictedY={data.predictedY}
                trueY={data.trueY}
                precomputedMetrics={data.precomputedMetrics}
                precomputedFeatureBins={data.precomputedFeatureBins}
                customMetrics={data.customMetrics}
                predictionType={data.predictionType}
                supportedBinaryClassificationAccuracyKeys={
                  App.supportedBinaryClassificationAccuracyKeys
                }
                supportedRegressionAccuracyKeys={
                  App.supportedRegressionAccuracyKeys
                }
                supportedProbabilityAccuracyKeys={
                  App.supportedProbabilityAccuracyKeys
                }
                stringParams={{ contextualHelp: App.messages }}
                requestMetrics={this.generateRandomMetrics.bind(this)}
                theme={theme}
                locale={this.state.language}
                key={Date.now()}
              />
            )}
          </div>
        </div>
      </div>
    );
  }

  private generateRandomMetrics(data, signal): Promise<IMetricResponse> {
    const binSize = Math.max(...data.binVector);
    const bins = new Array(binSize + 1).fill(0).map(() => Math.random());
    bins[2] = undefined;
    const promise = new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        resolve({
          global: Math.random(),
          bins
        });
      }, 300);
      if (signal) {
        signal.addEventListener("abort", () => {
          clearTimeout(timeout);
          reject(new DOMException("Aborted", "AbortError"));
        });
      }
    });
    return promise;
  }

  private handleChange = (event): void => {
    this.setState({ value: event.target.value });
  };

  private handleThemeChange = (event): void => {
    this.setState({ themeIndex: event.target.value });
  };

  private handleVersionChange = (event): void => {
    this.setState({ versionIndex: event.target.value });
  };

  private handleLanguageChange = (event): void => {
    this.setState({ language: event.target.value });
  };
}

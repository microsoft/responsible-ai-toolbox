import React from "react";
import { ErrorAnalysisDashboard } from "error-analysis-dashboard";
import { breastCancerData } from "../__mock_data/dummyData";
import { ibmData } from "../__mock_data/ibmData";
import { irisData } from "../__mock_data/irisData";
import { ibmDataInconsistent } from "../__mock_data/ibmDataInconsistent";
import { irisGlobal } from "../__mock_data/irisGlobal";
import { irisDataGlobal } from "../__mock_data/irisDataGlobal";
import { bostonData } from "../__mock_data/bostonData";
import { ebmData } from "../__mock_data/ebmData";
import { irisNoData } from "../__mock_data/irisNoData";
import { largeFeatureCount } from "../__mock_data/largeFeatureCount";
import { dummyTreeData } from "../__mock_data/dummyTree";
import { dummyMatrixData } from "../__mock_data/dummyMatrix";
import { createTheme } from "@uifabric/styling";

var ibmNoClass = _.cloneDeep(ibmData);
ibmNoClass.classNames = undefined;

var irisNoFeatures = _.cloneDeep(irisData);
irisNoFeatures.featureNames = undefined;

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

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: 4,
      themeIndex: 0,
      language: App.languages[0].val,
      showNewDash: 0
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleThemeChange = this.handleThemeChange.bind(this);
    this.generateRandomScore = this.generateRandomScore.bind(this);
    this.handleLanguageChange = this.handleLanguageChange.bind(this);
    this.handleViewChange = this.handleViewChange.bind(this);
  }

  static choices = [
    { label: "bostonData", data: bostonData },
    { label: "irisData", data: irisData },
    { label: "irisGlobal", data: irisGlobal },
    { label: "irisDataGlobal", data: irisDataGlobal },
    { label: "ibmData", data: ibmData },
    { label: "ibmDataInconsistent", data: ibmDataInconsistent },
    { label: "breastCancer", data: breastCancerData },
    { label: "ibmNoClass", data: ibmNoClass },
    { label: "irisNoFeature", data: irisNoFeatures },
    { label: "ebmData", data: ebmData },
    { label: "irisNoData", data: irisNoData },
    { label: "largeFeatureCount", data: largeFeatureCount }
  ];

  static themeChoices = [
    { label: "light", data: lightTheme },
    { label: "dark", data: darkTheme },
    { label: "darkHiContrast", data: darkContrastTheme }
  ];

  static languages = [
    { label: "english", val: "en-EN" },
    { label: "spanish", val: "es-ES" },
    { label: "german", val: "de" },
    { label: "simple Chinese", val: "zh-Hans" },
    { label: "japanese", val: "ja" }
  ];

  messages = {
    LocalExpAndTestReq: [{ displayText: "LocalExpAndTestReq" }],
    LocalOrGlobalAndTestReq: [{ displayText: "LocalOrGlobalAndTestReq" }],
    TestReq: [{ displayText: "TestReq" }],
    PredictorReq: [{ displayText: "PredictorReq" }]
  };

  handleChange(event) {
    this.setState({ value: event.target.value });
  }

  handleThemeChange(event) {
    this.setState({ themeIndex: event.target.value });
  }

  handleLanguageChange(event) {
    this.setState({ language: event.target.value });
  }

  handleViewChange(event) {
    this.setState({ showNewDash: +event.target.value });
  }

  generateRandomScore(data) {
    return Promise.resolve(data.map((x) => Math.random()));
  }

  generateRandomProbs(classDimensions, data, signal) {
    let promise = new Promise((resolve, reject) => {
      let timeout = setTimeout(() => {
        resolve(
          data.map((x) =>
            Array.from({ length: classDimensions }, (unused) => Math.random())
          )
        );
      }, 300);
      signal.addEventListener("abort", () => {
        clearTimeout(timeout);
        reject(new DOMException("Aborted", "AbortError"));
      });
    });

    return promise;
  }

  generateJsonTree(data, signal) {
    let promise = new Promise((resolve, reject) => {
      let timeout = setTimeout(() => {
        resolve(_.cloneDeep(dummyTreeData));
      }, 300);
      signal.addEventListener("abort", () => {
        clearTimeout(timeout);
        reject(new DOMException("Aborted", "AbortError"));
      });
    });

    return promise;
  }

  generateJsonMatrix(data, signal) {
    let promise = new Promise((resolve, reject) => {
      let timeout = setTimeout(() => {
        resolve(_.cloneDeep(dummyMatrixData));
      }, 300);
      signal.addEventListener("abort", () => {
        clearTimeout(timeout);
        reject(new DOMException("Aborted", "AbortError"));
      });
    });

    return promise;
  }

  generateFeatures() {
    return [
      "Feature1",
      "Feature2",
      "Feature3",
      "Feature4",
      "Feature5",
      "Feature6",
      "Feature7",
      "Feature8",
      "Feature9",
      "Feature10",
      "Feature11",
      "Feature12",
      "Feature13",
      "Feature14",
      "Feature15"
    ];
  }

  generateExplanatins(explanations, data, signal) {
    let promise = new Promise((resolve, reject) => {
      let timeout = setTimeout(() => {
        resolve(explanations);
      }, 300);
      signal.addEventListener("abort", () => {
        clearTimeout(timeout);
        reject(new DOMException("Aborted", "AbortError"));
      });
    });

    return promise;
  }

  render() {
    const data = _.cloneDeep(App.choices[this.state.value].data);
    const theme = App.themeChoices[this.state.themeIndex].data;
    // data.localExplanations = undefined;
    const classDimension =
      data.localExplanations &&
      Array.isArray(data.localExplanations.scores[0][0])
        ? data.localExplanations.scores.length
        : 1;
    return (
      <div style={{ backgroundColor: "grey", height: "100%" }}>
        <label>Select dataset:</label>
        <select value={this.state.value} onChange={this.handleChange}>
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
        <label>Select view:</label>
        <select value={this.state.showNewDash} onChange={this.handleViewChange}>
          <option key={"1"} value={0}>
            {"Version 1"}
          </option>
        </select>
        <div
          style={{
            width: "80vw",
            height: "90vh",
            backgroundColor: "white",
            margin: "50px auto"
          }}
        >
          <div style={{ width: "100%", height: "100%" }}>
            {this.state.showNewDash === 0 && (
              <ErrorAnalysisDashboard
                modelInformation={{ modelClass: "blackbox" }}
                dataSummary={{
                  featureNames: data.featureNames,
                  classNames: data.classNames
                }}
                testData={data.trainingData}
                predictedY={data.predictedY}
                probabilityY={data.probabilityY}
                trueY={data.trueY}
                precomputedExplanations={{
                  localFeatureImportance: data.localExplanations,
                  globalFeatureImportance: data.globalExplanation,
                  ebmGlobalExplanation: data.ebmData
                }}
                requestPredictions={this.generateRandomProbs.bind(
                  this,
                  classDimension
                )}
                requestDebugML={this.generateJsonTree.bind(this)}
                requestMatrix={this.generateJsonMatrix.bind(this)}
                localUrl={"https://www.bing.com/"}
                stringParams={{ contextualHelp: this.messages }}
                theme={theme}
                locale={this.state.language}
                key={new Date()}
                features={this.generateFeatures()}
              />
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default App;

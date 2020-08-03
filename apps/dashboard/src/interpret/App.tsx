import React from "react";
import { NewExplanationDashboard, ExplanationDashboard, ITelemetryMessage } from "@responsible-ai/interpret";
import { createTheme } from "@uifabric/styling";
import _ from "lodash";
import { breastCancerData } from "./__mock_data/dummyData";
import { ibmData } from "./__mock_data/ibmData";
import { irisData } from "./__mock_data/irisData";
import { ibmDataInconsistent } from "./__mock_data/ibmDataInconsistent";
import { irisGlobal } from "./__mock_data/irisGlobal";
import { irisDataGlobal } from "./__mock_data/irisDataGlobal";
import { bostonData } from "./__mock_data/bostonData";
import { bostonDataGlobal } from "./__mock_data/bostonDataGlobal";
import { ebmData } from "./__mock_data/ebmData";
import { irisNoData } from "./__mock_data/irisNoData";
import { largeFeatureCount } from "./__mock_data/largeFeatureCount";

const ibmNoClass = _.cloneDeep(ibmData);
ibmNoClass.classNames = undefined;
// initializeIcons();

const irisNoFeatures = _.cloneDeep(irisData);
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
        white: "#121212",
    },
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
        white: "#ffffff",
    },
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
        white: "#000000",
    },
});

export class App extends React.Component<any, any> {
    constructor(props) {
        super(props);
        this.state = { value: 4, themeIndex: 0, language: App.languages[0].val, showNewDash: 0 };
        this.handleChange = this.handleChange.bind(this);
        this.handleThemeChange = this.handleThemeChange.bind(this);
        this.generateRandomScore = this.generateRandomScore.bind(this);
        this.handleLanguageChange = this.handleLanguageChange.bind(this);
        this.handleViewChange = this.handleViewChange.bind(this);
    }

    private static choices = [
        { label: "bostonData", data: bostonData, dim: 1 },
        { label: "bostonDataGlobal", data: bostonDataGlobal, dim: 1 },
        { label: "irisData", data: irisData, dim: 3 },
        { label: "irisGlobal", data: irisGlobal, dim: 3 },
        { label: "irisDataGlobal", data: irisDataGlobal, dim: 3 },
        { label: "ibmData", data: ibmData, dim: 2 },
        { label: "ibmDataInconsistent", data: ibmDataInconsistent, dim: 2 },
        { label: "breastCancer", data: breastCancerData, dim: 2 },
        { label: "ibmNoClass", data: ibmNoClass, dim: 2 },
        { label: "irisNoFeature", data: irisNoFeatures, dim: 3 },
        { label: "ebmData", data: ebmData, dim: 2 },
        { label: "irisNoData", data: irisNoData, dim: 3 },
        { label: "largeFeatureCount", data: largeFeatureCount, dim: 2 },
    ];

    private static themeChoices = [
        { label: "light", data: lightTheme },
        { label: "dark", data: darkTheme },
        { label: "darkHiContrast", data: darkContrastTheme },
    ];

    private static languages = [
        { label: "english", val: "en-EN" },
        { label: "spanish", val: "es-ES" },
        { label: "german", val: "de" },
        { label: "simple Chinese", val: "zh-CN" },
        { label: "japanese", val: "ja" },
    ];

    private messages: any = {
        LocalExpAndTestReq: [{ displayText: "LocalExpAndTestReq" }],
        LocalOrGlobalAndTestReq: [{ displayText: "LocalOrGlobalAndTestReq" }],
        TestReq: [{ displayText: "TestReq" }],
        PredictorReq: [{ displayText: "PredictorReq" }],
    };

    private handleChange(event): void {
        this.setState({ value: event.target.value });
    }

    private handleThemeChange(event): void {
        this.setState({ themeIndex: event.target.value });
    }

    private handleLanguageChange(event): void {
        this.setState({ language: event.target.value });
    }

    private handleViewChange(event): void {
        this.setState({ showNewDash: +event.target.value });
    }

    private generateRandomScore(data, signal): Promise<any[]> {
        const promise = new Promise<any>((resolve, reject) => {
            const timeout = setTimeout(() => {
                resolve(data.map(() => Math.random()));
            }, 300);
            signal.addEventListener("abort", () => {
                clearTimeout(timeout);
                reject(new DOMException("Aborted", "AbortError"));
            });
        });

        return promise;
    }

    private generateRandomProbs(classDimensions, data, signal): Promise<any[]> {
        const promise = new Promise<any[]>((resolve, reject) => {
            const timeout = setTimeout(() => {
                resolve(data.map(() => Array.from({ length: classDimensions }, () => Math.random())));
            }, 300);
            signal.addEventListener("abort", () => {
                clearTimeout(timeout);
                reject(new DOMException("Aborted", "AbortError"));
            });
        });

        return promise;
    }

    // private generateExplanatins(explanations, _data, signal): Promise<any[]> {
    //     const promise = new Promise((resolve, reject) => {
    //         const timeout = setTimeout(() => {
    //             resolve(explanations);
    //         }, 300);
    //         signal.addEventListener("abort", () => {
    //             clearTimeout(timeout);
    //             reject(new DOMException("Aborted", "AbortError"));
    //         });
    //     });

    //     return promise;
    // }

    public render(): React.ReactNode {
        const data = _.cloneDeep(App.choices[this.state.value].data) as any;
        const theme = App.themeChoices[this.state.themeIndex].data;
        // data.localExplanations = undefined;
        const classDimension = App.choices[this.state.value].dim;
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
                <select value={this.state.language} onChange={this.handleLanguageChange}>
                    {App.languages.map(item => (
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
                    <option key={"2"} value={1}>
                        {"Version 2"}
                    </option>
                </select>
                <div style={{ width: "80vw", height: "90vh", backgroundColor: "white", margin: "50px auto" }}>
                    <div style={{ width: "100%", height: "100%" }}>
                        {this.state.showNewDash === 1 && (
                            <NewExplanationDashboard
                                modelInformation={{ modelClass: "blackbox" } as any}
                                dataSummary={{ featureNames: data.featureNames, classNames: data.classNames }}
                                testData={data.trainingData}
                                predictedY={data.predictedY}
                                probabilityY={data.probabilityY}
                                trueY={data.trueY}
                                precomputedExplanations={{
                                    localFeatureImportance: data.localExplanations,
                                    globalFeatureImportance: data.globalExplanation,
                                    ebmGlobalExplanation: data.ebmData,
                                }}
                                requestPredictions={
                                    classDimension === 1
                                        ? this.generateRandomScore
                                        : this.generateRandomProbs.bind(this, classDimension)
                                }
                                stringParams={{ contextualHelp: this.messages }}
                                telemetryHook={(er: ITelemetryMessage): void => {
                                    console.error(er.message);
                                }}
                                theme={theme}
                                explanationMethod="mimic"
                                locale={this.state.language}
                                key={Date.now()}
                            />
                        )}
                        {this.state.showNewDash === 0 && (
                            <ExplanationDashboard
                                modelInformation={{ modelClass: "blackbox" } as any}
                                dataSummary={{ featureNames: data.featureNames, classNames: data.classNames }}
                                testData={data.trainingData}
                                predictedY={data.predictedY}
                                probabilityY={data.probabilityY}
                                trueY={data.trueY}
                                precomputedExplanations={{
                                    localFeatureImportance: data.localExplanations,
                                    globalFeatureImportance: data.globalExplanation,
                                    ebmGlobalExplanation: data.ebmData,
                                }}
                                requestPredictions={this.generateRandomProbs.bind(this, classDimension)}
                                stringParams={{ contextualHelp: this.messages }}
                                telemetryHook={(er: ITelemetryMessage): void => {
                                    console.error(er.message);
                                }}
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
}

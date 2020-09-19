// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ITheme } from "office-ui-fabric-react";
import React from "react";
import { Redirect, generatePath } from "react-router-dom";

import { App as Fairness } from "../fairness/App";
import { App as Interpret } from "../interpret/App";

import { AppHeader } from "./AppHeader";
import { applications, IApplications, applicationKeys } from "./applications";
import { generateRoute } from "./generateRoute";
import { IAppSetting, routeKey } from "./IAppSetting";
import { languages } from "./languages";
import { themes } from "./themes";

interface IAppState extends Required<IAppSetting> {
  application: keyof IApplications;
  iteration: number;
}

export class App extends React.Component<IAppSetting, IAppState> {
  public static route = generateRoute(routeKey);
  public constructor(props: IAppSetting) {
    super(props);
    this.state = this.getState({ ...this.props, iteration: 0 });
  }
  public render(): React.ReactNode {
    const theme: ITheme = themes[this.state.theme];
    return (
      <>
        <AppHeader onSettingChanged={this.onSettingChanged} {...this.state} />
        <div
          style={{
            borderColor: "gray",
            borderWidth: 10,
            borderStyle: "solid",
            height: "calc(100% - 70px)",
            minHeight: "500px",
            width: "calc(100%-20px)",
            backgroundColor: theme.semanticColors.bodyBackground
          }}
          key={this.state.iteration}
        >
          {this.state.application === "interpret" && (
            <Interpret
              dataset={
                applications[this.state.application].datasets[
                  this.state.dataset
                ].data
              }
              classDimension={
                applications[this.state.application].datasets[
                  this.state.dataset
                ].classDimension
              }
              theme={theme}
              language={languages[this.state.language]}
              version={
                applications[this.state.application].versions[
                  this.state.version
                ]
              }
            />
          )}
          {this.state.application === "fairness" && (
            <Fairness
              dataset={
                applications[this.state.application].datasets[
                  this.state.dataset
                ].data
              }
              theme={themes[this.state.theme]}
              language={languages[this.state.language]}
              version={
                applications[this.state.application].versions[
                  this.state.version
                ]
              }
            />
          )}
        </div>
        <Redirect to={generatePath(App.route, this.state)} />
      </>
    );
  }
  private onSettingChanged = <T extends keyof IAppSetting>(
    field: T,
    value: IAppSetting[T]
  ): void => {
    this.setState((prev: IAppState) => {
      const newState = { ...prev, [field]: value };
      return this.getState(newState);
    });
  };

  private getState(props: IAppSetting & { iteration: number }): IAppState {
    const idx = applicationKeys.indexOf(
      props.application as keyof IApplications
    );
    const application: keyof IApplications =
      idx < 0 ? "interpret" : applicationKeys[idx];
    return {
      application,
      dataset:
        !props.dataset || !applications[application].datasets[props.dataset]
          ? Object.keys(applications[application].datasets)[0]
          : props.dataset,
      theme:
        !props.theme || !themes[props.theme]
          ? Object.keys(themes)[0]
          : props.theme,
      language:
        !props.language || !languages[props.language]
          ? Object.keys(languages)[0]
          : props.language,
      version:
        !props.version || !applications[application].versions[props.version]
          ? Object.keys(applications[application].versions)[0]
          : props.version,
      iteration: props.iteration + 1
    };
  }
}

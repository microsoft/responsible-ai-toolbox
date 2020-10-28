// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from "react";
import { Route, Switch, RouteComponentProps } from "react-router-dom";

import { Fairness } from "./Fairness";
import { IAppConfig } from "./IAppConfig";
import { IFairnessRouteProps } from "./IFairnessRouteProps";

export interface IAppState {
  config: IAppConfig;
}

export class App extends React.Component<unknown, IAppState> {
  public render(): React.ReactNode {
    return (
      <Switch>
        <Route path={Fairness.route} render={this.renderFairness} exact />
      </Switch>
    );
  }
  public async componentDidMount(): Promise<void> {
    const res = await (await fetch(new Request("/getconfig"))).json();
    this.setState({ config: res });
  }
  private readonly renderFairness = (
    props: RouteComponentProps<IFairnessRouteProps>
  ): React.ReactNode => {
    if (!this.state?.config) {
      return "Loading";
    }
    return <Fairness {...props.match.params} {...this.state.config} />;
  };
}

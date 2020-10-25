// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Spinner } from "office-ui-fabric-react";
import React from "react";
import { Route, Switch, RouteComponentProps } from "react-router-dom";

import { Fairness } from "./Fairness";
import { IAppConfig } from "./IAppConfig";
import { IFairnessRouteProps } from "./IFairnessRouteProps";

export interface IAppState {
  config: IAppConfig;
}

export class App extends React.Component<{}, IAppState> {
  public render(): React.ReactNode {
    return (
      <Switch>
        <Route path={Fairness.route} render={this.renderFairness} />
      </Switch>
    );
  }
  private readonly renderFairness = (
    props: RouteComponentProps<IFairnessRouteProps>
  ): React.ReactNode => {
    if (!this.state?.config) {
      return <Spinner />;
    }
    return <Fairness {...props.match.params} {...this.state.config} />;
  };
}

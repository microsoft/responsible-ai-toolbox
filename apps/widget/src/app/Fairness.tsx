// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { generateRoute } from "@responsible-ai/core-ui";
import { Spinner } from "office-ui-fabric-react";
import React from "react";

import { IAppConfig } from "./IAppConfig";
import { IFairnessRouteProps, routeKey } from "./IFairnessRouteProps";

export interface IFairnessState {}

export type IFairnessProps = IFairnessRouteProps & IAppConfig;
export class Fairness extends React.Component<IFairnessProps, IFairnessState> {
  public static route = generateRoute(routeKey);
  public render(): React.ReactNode {
    return <Spinner />;
  }
}

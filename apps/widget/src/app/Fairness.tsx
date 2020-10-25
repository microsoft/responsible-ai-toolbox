// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { generateRoute } from "@responsible-ai/core-ui";
import {
  FairnessWizardV2,
  IFairnessProps as IFairnessWizardProps
} from "@responsible-ai/fairness";
import { Spinner } from "office-ui-fabric-react";
import React from "react";

import { IAppConfig } from "./IAppConfig";
import { IFairnessRouteProps, routeKey } from "./IFairnessRouteProps";

export interface IFairnessState {
  fairnessConfig: IFairnessWizardProps | undefined;
}

export type IFairnessProps = IFairnessRouteProps & IAppConfig;
export class Fairness extends React.Component<IFairnessProps, IFairnessState> {
  public static route = generateRoute(routeKey);
  public async componentDidMount(): Promise<void> {
    const res = await (
      await fetch(new Request(`/getmodel/${this.props.model}`))
    ).json();
    this.setState({ fairnessConfig: res });
  }
  public render(): React.ReactNode {
    if (this.state?.fairnessConfig) {
      return <FairnessWizardV2 {...this.state.fairnessConfig} />;
    }
    return <Spinner />;
  }
}

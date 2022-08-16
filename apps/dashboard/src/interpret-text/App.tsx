// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ITheme } from "@fluentui/react";
import { ITextExplanationDashboardData } from "@responsible-ai/core-ui";
import {
  TextExplanationDashboard,
  ITextExplanationDashboardProps
} from "@responsible-ai/interpret-text";
import { Language } from "@responsible-ai/localization";
import React from "react";

interface IAppProps {
  dataset: ITextExplanationDashboardData;
  theme: ITheme;
  language: Language;
  version: 1;
}

export class App extends React.Component<IAppProps> {
  public render(): React.ReactNode {
    const dashboardProp: ITextExplanationDashboardProps = {
      dataSummary: this.props.dataset
    };
    return <TextExplanationDashboard {...dashboardProp} />;
  }
}

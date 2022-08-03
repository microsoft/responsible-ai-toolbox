// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ITheme } from "@fluentui/react";
import { IVisionExplanationDashboardData } from "@responsible-ai/core-ui";
import {
  VisionExplanationDashboard,
  IVisionExplanationDashboardProps
} from "@responsible-ai/interpret-vision";
import { Language } from "@responsible-ai/localization";
import React from "react";

interface IAppProps {
  dataset: IVisionExplanationDashboardData;
  theme: ITheme;
  language: Language;
  version: 1;
}

export class App extends React.Component<IAppProps> {
  public render(): React.ReactNode {
    const dashboardProp: IVisionExplanationDashboardProps = {
      dataSummary: this.props.dataset
    };
    return <VisionExplanationDashboard {...dashboardProp} />;
  }
}

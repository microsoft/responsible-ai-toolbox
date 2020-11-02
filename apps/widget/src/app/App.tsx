// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from "react";

import { config } from "./config";
import { Fairness } from "./Fairness";

export class App extends React.Component {
  public render(): React.ReactNode {
    switch (config.dashboardType) {
      case "Fairness":
        return <Fairness />;
      default:
        return "Not Found";
    }
  }
}

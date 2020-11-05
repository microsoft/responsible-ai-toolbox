// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from "react";

import { config } from "./config";
import { Fairness } from "./Fairness";
import { Interpret } from "./Interpret";

export class App extends React.Component {
  public render(): React.ReactNode {
    switch (config.dashboardType) {
      case "Fairness":
        return <Fairness />;
      case "Interpret":
        return <Interpret />;
      default:
        return "Not Found";
    }
  }
}

// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Stack } from "@fluentui/react";
import React from "react";

export class EmptyHeader extends React.Component {
  public render(): React.ReactNode {
    return (
      <Stack
        horizontal
        horizontalAlign="space-between"
        verticalAlign="center"
        style={{ height: "36px" }}
      />
    );
  }
}

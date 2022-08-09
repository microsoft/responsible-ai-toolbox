// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from "react";

export class IInterpretVisionProps {}

export class InterpretVision extends React.Component<IInterpretVisionProps> {
  public constructor(props: IInterpretVisionProps) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <div>
        <h1>Welcome</h1>
      </div>
    );
  }
}

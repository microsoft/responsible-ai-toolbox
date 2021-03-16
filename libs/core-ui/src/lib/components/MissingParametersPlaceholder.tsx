// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Text } from "office-ui-fabric-react";
import React from "react";

import { missingParametersPlaceholderStyles } from "./MissingParametersPlaceholder.styles";

export interface IMissingParametersPlaceholderProps {
  children: string;
}

export class MissingParametersPlaceholder extends React.Component<
  IMissingParametersPlaceholderProps
> {
  public render(): React.ReactNode {
    const classNames = missingParametersPlaceholderStyles();
    return (
      <div className={classNames.missingParametersPlaceholder}>
        <div className={classNames.missingParametersPlaceholderSpacer}>
          <Text variant="large" className={classNames.faintText}>
            {this.props.children}
          </Text>
        </div>
      </div>
    );
  }
}

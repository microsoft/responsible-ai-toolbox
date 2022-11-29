// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Link } from "@fluentui/react";
import React from "react";

export interface ICohortNameColumnProps {
  disabled?: boolean;
  fieldContent: string;
  name: string | number;
  onClick(name: string | number): void;
}

export class CohortNameColumn extends React.Component<ICohortNameColumnProps> {
  public render(): React.ReactNode {
    return (
      <Link onClick={this.onClick} disabled={this.props.disabled}>
        {this.props.fieldContent}
      </Link>
    );
  }

  private onClick = (): void => {
    this.props.onClick(this.props.name);
  };
}

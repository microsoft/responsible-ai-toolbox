// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Link } from "@fluentui/react";
import React from "react";

export interface ICohortNameColumnProps {
  disabled?: boolean;
  fieldContent: string;
  name: string | number;
  onEditCohortClick(name: string | number): void;
}

export class CohortNameColumn extends React.Component<ICohortNameColumnProps> {
  public render(): React.ReactNode {
    return (
      <Link onClick={this.onEditCohortClick} disabled={this.props.disabled}>
        {this.props.fieldContent}
      </Link>
    );
  }

  private onEditCohortClick = () => {
    this.props.onEditCohortClick(this.props.name);
  };
}

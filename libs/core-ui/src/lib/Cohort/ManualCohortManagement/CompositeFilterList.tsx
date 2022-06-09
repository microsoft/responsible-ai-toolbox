// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IconButton } from "@fluentui/react";
import React from "react";

import { JointDataset } from "../../util/JointDataset";

export interface ICompositeFilterListProps {
  compositeStrings: string[];
  jointDataset: JointDataset;
  removeFilter?(index: number): void;
}
export class CompositeFilterList extends React.Component<ICompositeFilterListProps> {
  public render(): React.ReactNode {
    return this.props.compositeStrings.map((filter, index) => {
      return (
        <div key={index}>
          {filter}
          {this.props.removeFilter && (
            <IconButton
              id={`removeFilterBtn-${index}`}
              iconProps={{ iconName: "Clear" }}
              onClick={(): void => this.props.removeFilter?.(index)}
            />
          )}
        </div>
      );
    });
  }
}

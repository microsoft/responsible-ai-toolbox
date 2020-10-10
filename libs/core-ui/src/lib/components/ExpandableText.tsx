// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { localization } from "@responsible-ai/localization";
import { Text, Link, ITextProps } from "office-ui-fabric-react";
import React from "react";

export interface IExpandableTextProps extends ITextProps {
  collapsedText: string;
  expandedText: string;
}

interface IExpandableTextState {
  expanded: boolean;
}

export class ExpandableText extends React.Component<
  IExpandableTextProps,
  IExpandableTextState
> {
  public render(): React.ReactNode {
    if (this.state?.expanded) {
      return (
        <Text {...this.props}>
          {this.props.children}
          {this.props.collapsedText}
          {this.props.expandedText}
          <Link onClick={this.collapse}>
            {localization.Core.ExpandableText.SeeLess}
          </Link>
        </Text>
      );
    }
    return (
      <Text>
        {this.props.children}
        {this.props.collapsedText}
        <Link onClick={this.expand}>
          {localization.Core.ExpandableText.SeeMore}
        </Link>
      </Text>
    );
  }
  private readonly collapse = (): void => {
    this.setState({ expanded: false });
  };
  private readonly expand = (): void => {
    this.setState({ expanded: true });
  };
}

// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Text, Link, ITextProps, Icon } from "@fluentui/react";
import { localization } from "@responsible-ai/localization";
import React from "react";

export interface IExpandableTextProps extends ITextProps {
  expandedText?: string;
  iconName?: string;
}

interface IExpandableTextState {
  expanded: boolean;
}

export class ExpandableText extends React.Component<
  IExpandableTextProps,
  IExpandableTextState
> {
  public render(): React.ReactNode {
    return (
      <Text {...this.props}>
        {this.props.iconName && (
          <>
            <Icon iconName={this.props.iconName} />
            &nbsp;
          </>
        )}
        {this.props.children}
        {this.state?.expanded && (
          <>
            &nbsp;
            {this.props.expandedText}
          </>
        )}
        {this.props.expandedText && (
          <>
            &nbsp;
            <Link onClick={this.toggle}>
              {this.state?.expanded
                ? localization.Core.ExpandableText.SeeLess
                : localization.Core.ExpandableText.SeeMore}
            </Link>
          </>
        )}
      </Text>
    );
  }
  private readonly toggle = (): void => {
    this.setState((prev) => ({ expanded: !prev?.expanded }));
  };
}

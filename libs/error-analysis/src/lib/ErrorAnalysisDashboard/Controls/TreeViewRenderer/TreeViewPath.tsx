// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from "react";

export interface ITreeViewLink {
  d: string;
  id: string;
  key: string;
  style: React.CSSProperties | undefined;
}

export interface ITreeViewPathProps {
  link: ITreeViewLink;
  onMouseOver: (linkId: string) => void;
  onMouseOut: () => void;
}

export class TreeViewPath extends React.Component<ITreeViewPathProps> {
  public render(): React.ReactNode {
    const { link } = this.props;

    return (
      <path
        key={link.key}
        id={link.id}
        d={link.d}
        pointerEvents="all"
        style={link.style}
        onMouseOver={this.onMouseOver}
        onMouseOut={this.onMouseOut}
      />
    );
  }

  private onMouseOver = (): void => {
    this.props.onMouseOver(this.props.link.id);
  };

  private onMouseOut = (): void => {
    this.props.onMouseOut();
  };
}

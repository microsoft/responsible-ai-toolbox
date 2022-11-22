// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { getTheme } from "@fluentui/react";
import React from "react";
import ReactDom from "react-dom";

import { SVGToolTipStyles } from "./SVGToolTip.styles";

export interface ISVGToolTipProps {
  target: React.RefObject<SVGElement>;
  spacing?: number;
}
export interface ISVGToolTipState {
  isMouseOver: boolean;
  svgElement: SVGSVGElement | undefined;
  x: number;
  y: number;
}

export class SVGToolTip extends React.Component<
  ISVGToolTipProps,
  ISVGToolTipState
> {
  public constructor(props: ISVGToolTipProps) {
    super(props);
    this.state = {
      isMouseOver: false,
      svgElement: undefined,
      x: 0,
      y: 0
    };
  }
  public componentDidMount(): void {
    const element = this.props.target.current;
    if (element) {
      element.addEventListener("mouseenter", this.onMouseEnter);
      element.addEventListener("focus", this.onMouseEnter);
      element.addEventListener("mouseleave", this.onMouseLeave);
      element.addEventListener("focusout", this.onMouseLeave);
    }
  }
  public render(): React.ReactNode {
    if (!this.state.svgElement || !this.state.isMouseOver) {
      return React.Fragment;
    }
    const classNames = SVGToolTipStyles();
    const theme = getTheme();
    return ReactDom.createPortal(
      <g
        style={{ transform: `translate(${this.state.x}px, ${this.state.y}px)` }}
        pointerEvents="none" // tooltip should never grab mouse > prevent flickering
      >
        <rect
          className={classNames.tooltipRect}
          strokeWidth="2"
          fill={theme.semanticColors.bodyBackground}
          height="100"
          width="80"
          y="0"
          x="0"
        />
        {this.props.children}
      </g>,
      this.state.svgElement
    );
  }

  private onMouseEnter = (): void => {
    const element = this.props.target.current;
    if (element?.ownerSVGElement) {
      const rect = element.getBoundingClientRect();
      const pos = this.svgPoint(
        element.ownerSVGElement,
        rect.x + rect.width + (this.props.spacing ?? 0),
        rect.y
      );
      this.setState({
        isMouseOver: true,
        svgElement: element.ownerSVGElement,
        x: pos.x,
        y: pos.y
      });
    }
  };

  private onMouseLeave = (): void => {
    this.setState({ isMouseOver: false });
  };

  private svgPoint = (
    svg: SVGSVGElement,
    x: number,
    y: number
  ): { x: number; y: number } => {
    const ctm = svg.getScreenCTM();
    if (svg.createSVGPoint && ctm) {
      let point = svg.createSVGPoint();
      point.x = x;
      point.y = y;
      point = point.matrixTransform(ctm.inverse());
      return { x: point.x, y: point.y };
    }
    const rect = svg.getBoundingClientRect();
    return {
      x: x - rect.left - svg.clientLeft,
      y: y - rect.top - svg.clientTop
    };
  };
}

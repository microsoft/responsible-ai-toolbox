// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from "react";

import { ColorPalette } from "../../ColorPalette";

import { gradientStyles } from "./Gradient.styles";

export interface IGradientProps {
  max: number;
  minPct: number;
  value: number;
  isRate: boolean;
  isErrorMetric: boolean;
}

export class Gradient extends React.Component<IGradientProps> {
  public render(): React.ReactNode {
    const classNames = gradientStyles();
    const errorRateRectHeight = 40;
    let maxValue: number = this.props.max;
    if (this.props.isRate) {
      maxValue = maxValue * 100;
    }
    const gradentMidValue = (1 / (maxValue / 100)) * this.props.minPct;
    let gradientMidPct: number;
    if (this.props.isRate) {
      gradientMidPct = 100 - gradentMidValue * 100;
    } else {
      gradientMidPct = 100 - gradentMidValue;
    }
    const errorRateLineHeight =
      errorRateRectHeight - (this.props.value / maxValue) * errorRateRectHeight;
    const gradientMidPctStr = `${gradientMidPct}%`;
    const minColor = this.props.isErrorMetric
      ? ColorPalette.MinErrorColor
      : ColorPalette.MinMetricColor;
    const maxColor = this.props.isErrorMetric
      ? ColorPalette.MaxErrorColor
      : ColorPalette.MaxMetricColor;
    const errorAvgColor = ColorPalette.ErrorAvgColor;
    return (
      <g>
        <linearGradient
          id="gradient"
          x1="0%"
          x2="100%"
          gradientTransform="rotate(90)"
        >
          <stop offset="0%" stopColor={maxColor} />
          <stop offset={gradientMidPctStr} stopColor={minColor} />
          <stop offset={gradientMidPctStr} stopColor={errorAvgColor} />
          <stop offset="100%" stopColor={errorAvgColor} />
        </linearGradient>
        <rect
          x="0"
          y="0"
          width="40"
          height={errorRateRectHeight}
          fill="url(#gradient)"
        />
        <g>
          <line
            x1="0"
            y1={errorRateLineHeight}
            x2="40"
            y2={errorRateLineHeight}
            className={classNames.gradientTick}
          />
        </g>
      </g>
    );
  }
}

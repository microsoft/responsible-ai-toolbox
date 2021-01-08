// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from "react";

import { ColorPalette } from "../../ColorPalette";
import { ErrorCohort } from "../../ErrorCohort";

import { errorRateGradientStyles } from "./ErrorRateGradient.styles";

export interface IErrorRateGradientProps {
  max: number;
  minPct: number;
  selectedCohort: ErrorCohort;
}

export class ErrorRateGradient extends React.Component<
  IErrorRateGradientProps
> {
  public render(): React.ReactNode {
    const classNames = errorRateGradientStyles();
    const errorRateRectHeight = 40;
    const errorRateLineHeight =
      errorRateRectHeight -
      (this.props.selectedCohort.errorRate / (this.props.max * 100)) *
        errorRateRectHeight;
    const gradientMidPct = `${100 - (1 / this.props.max) * this.props.minPct}%`;
    const minColor = ColorPalette.MinColor;
    const maxColor = ColorPalette.MaxColor;
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
          <stop offset={gradientMidPct} stopColor={minColor} />
          <stop offset={gradientMidPct} stopColor={errorAvgColor} />
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

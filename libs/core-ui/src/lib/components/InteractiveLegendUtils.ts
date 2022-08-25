// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { interactiveLegendStyles } from "./InteractiveLegend.styles";

export function getColorBoxClassName(
  index: number,
  color?: string,
  activated?: boolean
): string {
  const classes = interactiveLegendStyles(activated, color);
  // this is used as data series symbol in the side panel, the sequence needs to be consist with the sequence of symbols in ScatterUtils getScatterSymbols()
  switch (true) {
    case index % 5 === 1:
      return classes.squareColorBox;
    case index % 5 === 2:
      return classes.diamondColorBox;
    case index % 5 === 3:
      return classes.triangleColorBox;
    case index % 5 === 4:
      return classes.triangleDownColorBox;
    default:
      return classes.circleColorBox;
  }
}

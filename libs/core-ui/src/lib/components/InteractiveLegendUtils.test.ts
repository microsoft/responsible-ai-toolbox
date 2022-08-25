// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { interactiveLegendStyles } from "./InteractiveLegend.styles";
import { getColorBoxClassName } from "./InteractiveLegendUtils";

describe("InteractiveLegend", () => {
  it("should get the correct colorBox className", () => {
    const classes = interactiveLegendStyles();
    const classNames = [
      classes.circleColorBox,
      classes.squareColorBox,
      classes.diamondColorBox,
      classes.triangleColorBox,
      classes.triangleDownColorBox
    ];
    classNames.forEach((className, index) => {
      expect(getColorBoxClassName(index)).toEqual(className);
    });
  });
});

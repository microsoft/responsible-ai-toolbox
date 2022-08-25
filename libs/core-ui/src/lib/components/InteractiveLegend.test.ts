import { interactiveLegendStyles } from "./InteractiveLegend.styles";
import { getColorBoxClassName } from "./InteractiveLegendUtils";

describe("InteractiveLegend", () => {
  it("should get the correct colorBox className", () => {
    const classes = interactiveLegendStyles();
    expect(getColorBoxClassName(0)).toEqual(classes.circleColorBox);
    expect(getColorBoxClassName(1)).toEqual(classes.squareColorBox);
    expect(getColorBoxClassName(2)).toEqual(classes.diamondColorBox);
    expect(getColorBoxClassName(3)).toEqual(classes.triangleColorBox);
    expect(getColorBoxClassName(4)).toEqual(classes.triangleDownColorBox);
  });
});

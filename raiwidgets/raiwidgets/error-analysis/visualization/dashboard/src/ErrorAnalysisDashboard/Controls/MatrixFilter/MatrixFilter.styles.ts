import {
  IStyle,
  mergeStyleSets,
  IProcessedStyleSet,
  getTheme
} from "office-ui-fabric-react";

export interface IMatrixFilterStyles {
  matrixFilter: IStyle;
}

export const matrixFilterStyles: () => IProcessedStyleSet<
  IMatrixFilterStyles
> = () => {
  const theme = getTheme();
  return mergeStyleSets<IMatrixFilterStyles>({
    matrixFilter: {
      padding: "0px 0px 0px 25px"
    }
  });
};

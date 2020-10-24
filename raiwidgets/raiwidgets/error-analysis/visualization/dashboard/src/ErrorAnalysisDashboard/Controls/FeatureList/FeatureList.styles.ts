import {
  IStyle,
  mergeStyleSets,
  IProcessedStyleSet,
  getTheme
} from "office-ui-fabric-react";

export interface IFeatureListStyles {
  featureList: IStyle;
  decisionTree: IStyle;
}

export const featureListStyles: () => IProcessedStyleSet<
  IFeatureListStyles
> = () => {
  const theme = getTheme();
  return mergeStyleSets<IFeatureListStyles>({
    featureList: {
      boxSizing: "border-box",
      color: theme.palette.black,
      backgroundColor: theme.palette.white,
      border: "1px solid #C8C8C8"
    },
    decisionTree: {
      fontSize: "18px",
      color: "#2d394a"
    }
  });
};

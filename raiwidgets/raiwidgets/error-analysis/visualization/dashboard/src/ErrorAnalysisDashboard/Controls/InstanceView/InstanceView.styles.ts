import {
  IStyle,
  mergeStyleSets,
  IProcessedStyleSet,
  ITheme,
  getTheme
} from "office-ui-fabric-react";

export interface IInstanceViewStyles {
  pivotLabelWrapper: IStyle;
  page: IStyle;
}

export const InstanceViewStyles: () => IProcessedStyleSet<
  IInstanceViewStyles
> = () => {
  const theme = getTheme();
  return mergeStyleSets<IInstanceViewStyles>({
    pivotLabelWrapper: {
      justifyContent: "flex-start",
      display: "flex",
      flexDirection: "row",
      padding: "5px 60px 5px 60px"
    },
    page: {
      maxHeight: "1000px",
      backgroundColor: theme.semanticColors.bodyBackground,
      color: theme.semanticColors.bodyText
    }
  });
};

import { IStyle, mergeStyleSets, IProcessedStyleSet, getTheme } from "office-ui-fabric-react";

export interface IExplanationDashboardStyles {
  pivotLabelWrapper: IStyle;
  page: IStyle;
}

export const explanationDashboardStyles: () => IProcessedStyleSet<IExplanationDashboardStyles> = () => {
  const theme = getTheme();
  return mergeStyleSets<IExplanationDashboardStyles>({
    pivotLabelWrapper: {
      justifyContent: "space-between",
      display: "flex",
      flexDirection: "row",
      padding: "0 30px",
    },
    page: {
      maxHeight: "1000px",
      backgroundColor: theme.semanticColors.bodyBackground,
      color: theme.semanticColors.bodyText,
    },
  });
};

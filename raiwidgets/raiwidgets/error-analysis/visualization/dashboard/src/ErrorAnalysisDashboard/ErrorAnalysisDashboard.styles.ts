import {
  IStyle,
  mergeStyleSets,
  IProcessedStyleSet,
  ITheme,
  getTheme
} from "office-ui-fabric-react";

export interface IErrorAnalysisDashboardStyles {
  pivotLabelWrapper: IStyle;
  page: IStyle;
}

export const ErrorAnalysisDashboardStyles: () => IProcessedStyleSet<
  IErrorAnalysisDashboardStyles
> = () => {
  const theme = getTheme();
  return mergeStyleSets<IErrorAnalysisDashboardStyles>({
    pivotLabelWrapper: {
      justifyContent: "space-between",
      display: "flex",
      flexDirection: "row",
      padding: "10px 30px"
    },
    page: {
      maxHeight: "1000px",
      backgroundColor: theme.semanticColors.bodyBackground,
      color: theme.semanticColors.bodyText
    }
  });
};

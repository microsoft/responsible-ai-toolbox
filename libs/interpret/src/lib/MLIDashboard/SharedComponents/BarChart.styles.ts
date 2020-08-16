import {
  IStyle,
  mergeStyleSets,
  IProcessedStyleSet
} from "office-ui-fabric-react";

export interface IBarChartStyles {
  barChart: IStyle;
  centered: IStyle;
}

export const barChartStyles: IProcessedStyleSet<IBarChartStyles> = mergeStyleSets<
  IBarChartStyles
>({
  barChart: {
    width: "100%",
    flex: 1
  },
  centered: {
    margin: "auto"
  }
});

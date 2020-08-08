import { IProcessedStyleSet, mergeStyleSets, IStyle } from "@uifabric/styling";

export interface IMultiIcePlotStyles {
  iceWrapper: IStyle;
  controlArea: IStyle;
  parameterList: IStyle;
  placeholder: IStyle;
  chartWrapper: IStyle;
}

export const multiIcePlotStyles: () => IProcessedStyleSet<IMultiIcePlotStyles> = () => {
  return mergeStyleSets<IMultiIcePlotStyles>({
    iceWrapper: {
      display: "flex",
      flexDirection: "column",
      flex: "1",
      justifyContent: "stretch",
    },
    controlArea: {
      display: "flex",
      padding: "10px 15px 3px 67px",
      justifyContent: "space-between",
    },
    parameterList: {
      display: "flex",
      flex: "1",
    },
    placeholder: {
      margin: "auto",
      padding: "40px",
      fontSize: "25px",
    },
    chartWrapper: {
      flex: "1",
    },
  });
};

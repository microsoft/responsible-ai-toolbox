import {
  IStyle,
  mergeStyleSets,
  IProcessedStyleSet
} from "office-ui-fabric-react";

export interface IScatterStyles {
  explanationChart: IStyle;
  topControls: IStyle;
  selector: IStyle;
  selectorLabel: IStyle;
  labelText: IStyle;
  comboBox: IStyle;
  calloutInfo: IStyle;
  button: IStyle;
}

export const scatterStyles: IProcessedStyleSet<IScatterStyles> = mergeStyleSets<
  IScatterStyles
>({
  explanationChart: {
    width: "100%",
    height: "100%",
    flex: "1",
    display: "flex",
    flexDirection: "column"
  },
  topControls: {
    display: "flex",
    padding: "3px 15px",
    justifyContent: "space-between"
  },
  selector: {
    display: "flex"
  },
  selectorLabel: {
    display: "flex",
    flexDirection: "row"
  },
  labelText: {
    maxWidth: "84px",
    lineHeight: "14px",
    marginRight: "-16px",
    fontSize: "14px",
    fontFamily: ` "Segoe UI", "Segoe UI Web (West European)", "Segoe UI",
      -apple-system, BlinkMacSystemFont, Roboto, "Helvetica Neue",
      sans-serif`
  },
  comboBox: {
    maxWidth: "208px"
  },
  calloutInfo: {
    display: "flex",
    flexDirection: "column",
    maxWidth: "300px",
    padding: "30px",
    fontFamily: `"Segoe UI", "Segoe UI Web (West European)", "Segoe UI",
      -apple-system, BlinkMacSystemFont, Roboto, "Helvetica Neue", sans-serif`
  },
  button: {
    maxWidth: "100px"
  }
});

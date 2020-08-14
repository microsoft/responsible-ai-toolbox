import {
  IStyle,
  mergeStyleSets,
  IProcessedStyleSet
} from "office-ui-fabric-react";

export interface IBeehiveStyles {
  aggregateChart: IStyle;
  topControls: IStyle;
  featureSlider: IStyle;
  pathSelector: IStyle;
  selectorLabel: IStyle;
  sliderControl: IStyle;
  sliderLabel: IStyle;
  labelText: IStyle;
  calloutInfo: IStyle;
  calloutButton: IStyle;
}

export const beehiveStyles: IProcessedStyleSet<IBeehiveStyles> = mergeStyleSets<
  IBeehiveStyles
>({
  aggregateChart: {
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "column"
  },
  topControls: {
    display: "flex",
    padding: "3px 15px"
  },
  featureSlider: {
    flex: 1
  },
  pathSelector: {
    margin: "0 5px 0 0"
  },
  selectorLabel: {
    display: "flex",
    flexDirection: "row",
    marginTop: "5px",
    fontFamily: `"Segoe UI", "Segoe UI Web (West European)", "Segoe UI",
              -apple-system, BlinkMacSystemFont, Roboto, "Helvetica Neue",
              sans-serif`
  },
  sliderControl: {
    flex: 1,
    padding: "0 4px"
  },
  sliderLabel: {
    display: "flex",
    flexDirection: "row"
  },
  labelText: {
    lineHeight: "14px",
    margin: "7px 0 0 4px",
    fontSize: "14px",
    fontFamily: `"Segoe UI", "Segoe UI Web (West European)", "Segoe UI",
      -apple-system, BlinkMacSystemFont, Roboto, "Helvetica Neue",
      sans-serif`
  },
  calloutInfo: {
    display: "flex",
    flexDirection: "column",
    maxWidth: "300px",
    padding: "30px",
    fontFamily: `"Segoe UI", "Segoe UI Web (West European)", "Segoe UI",
    -apple-system, BlinkMacSystemFont, Roboto, "Helvetica Neue", sans-serif`
  },
  calloutButton: {
    maxWidth: "100px"
  }
});

import {
  IStyle,
  mergeStyleSets,
  IProcessedStyleSet
} from "office-ui-fabric-react";

export interface IICEPlotStyles {
  iceWrapper: IStyle;
  loading: IStyle;
  featurePicker: IStyle;
  rangeView: IStyle;
  parameterSet: IStyle;
  secondWrapper: IStyle;
  chartWrapper: IStyle;
}

export const iCEPlotStyles: IProcessedStyleSet<IICEPlotStyles> = mergeStyleSets<
  IICEPlotStyles
>({
  iceWrapper: {
    display: "flex",
    flexDirection: "column",
    flex: 1
  },
  loading: {
    margin: "auto",
    fontFamily: `"Segoe UI", "Segoe UI Web (West European)", "Segoe UI",
          -apple-system, BlinkMacSystemFont, Roboto, "Helvetica Neue", sans-serif`,
    padding: "40px",
    fontSize: "25px"
  },
  featurePicker: {
    display: "flex",
    padding: "3px 15px",
    justifyContent: "space-between",
    borderBottom: "1px solid grey"
  },
  rangeView: {
    display: "flex",
    justifyContent: "flex-end"
  },
  parameterSet: {
    display: "flex"
  },
  secondWrapper: {
    width: "100%",
    flex: 1
  },
  chartWrapper: { height: "100%" }
});

// .ICE-wrapper {
//   .unavailable,
//   .charting-prompt,
//   .loading {
//   }
//   .feature-picker {
//   }
//   .rangeview {
//     .parameter-set {
//     }
//   }
//   .second-wrapper {
//   }
//   .chart-wrapper {
//   }
// }

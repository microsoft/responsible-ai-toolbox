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
>({});

// .aggregate-chart {
//   width: 100%,
//   height: 100%,
//   display: flex,
//   flexDirection: column,
//   .top-controls {
//     display: flex,
//     padding: 3px 15px,
//     .feature-slider {
//       flex: 1,
//     }
//     .path-selector {
//       margin: 0 5px 0 0,
//     }
//     .selector-label {
//       display: flex,
//       flexDirection: row,
//       span {
//         padding-top: 5px,
//         fontFamily:: "Segoe UI", "Segoe UI Web (West European)", "Segoe UI",
//           -apple-system, BlinkMacSystemFont, Roboto, "Helvetica Neue",
//           sans-serif,
//       }
//     }
//     .slider-control {
//       flex: 1,
//       padding: 0 4px,
//       .slider-label {
//         display: flex,
//         flexDirection: row,
//         .label-text {
//           line-height: 14px,
//           margin: 7px 0 0 4px,
//           font-size: 14px,
//           fontFamily:: "Segoe UI", "Segoe UI Web (West European)", "Segoe UI",
//             -apple-system, BlinkMacSystemFont, Roboto, "Helvetica Neue",
//             sans-serif,
//         }
//       }
//     }
//   }
// }

// .callout-info {
//   display: flex,
//   flexDirection: column,
//   maxWidth: 300px,
//   padding: 30px,
//   fontFamily:: "Segoe UI", "Segoe UI Web (West European)", "Segoe UI",
//     -apple-system, BlinkMacSystemFont, Roboto, "Helvetica Neue", sans-serif,

//   button {
//     maxWidth: 100px,
//   }
// }

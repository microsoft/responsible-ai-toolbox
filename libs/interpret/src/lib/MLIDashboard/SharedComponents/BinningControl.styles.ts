import {
  IStyle,
  mergeStyleSets,
  IProcessedStyleSet
} from "office-ui-fabric-react";

export interface IBinningControlStyles {
  featurePicker: IStyle;
  rangeView: IStyle;
  parameterSet: IStyle;
}

export const binningControlStyles: IProcessedStyleSet<IBinningControlStyles> = mergeStyleSets<
  IBinningControlStyles
>({
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
  parameterSet: { display: "flex" }
});

// .feature-picker {
// }
// .rangeview {
//   .parameter-set {
//     ,
//   }
// }

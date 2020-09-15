// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IStyle,
  mergeStyleSets,
  IProcessedStyleSet
} from "office-ui-fabric-react";

export interface IPredictionLabelStyles {
  predictionArea: IStyle;
  predictionLabel: IStyle;
  probabilityLabel: IStyle;
}

export const predictionLabelStyles: IProcessedStyleSet<IPredictionLabelStyles> = mergeStyleSets<
  IPredictionLabelStyles
>({
  predictionArea: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    fontSize: "20px"
  },
  predictionLabel: {},
  probabilityLabel: {
    margin: "auto",
    padding: "5px",
    fontFamily: `"Segoe UI", "Segoe UI Web (West European)", "Segoe UI",
      -apple-system, BlinkMacSystemFont, Roboto, "Helvetica Neue", sans-serif`
  }
});

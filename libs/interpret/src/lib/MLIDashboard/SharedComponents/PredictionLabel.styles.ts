// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IStyle, mergeStyleSets, IProcessedStyleSet } from "@fluentui/react";

export interface IPredictionLabelStyles {
  predictionArea: IStyle;
  predictionLabel: IStyle;
  probabilityLabel: IStyle;
}

export const predictionLabelStyles: IProcessedStyleSet<IPredictionLabelStyles> =
  mergeStyleSets<IPredictionLabelStyles>({
    predictionArea: {
      alignItems: "center",
      display: "flex",
      flexWrap: "wrap",
      fontSize: "20px"
    },
    predictionLabel: {},
    probabilityLabel: {
      margin: "auto",
      padding: "5px"
    }
  });

// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IStyle, mergeStyleSets, IProcessedStyleSet } from "@fluentui/react";

export interface IICEPlotStyles {
  iceWrapper: IStyle;
  loading: IStyle;
  featurePicker: IStyle;
  rangeView: IStyle;
  parameterSet: IStyle;
  secondWrapper: IStyle;
  chartWrapper: IStyle;
}

export const iCEPlotStyles: IProcessedStyleSet<IICEPlotStyles> =
  mergeStyleSets<IICEPlotStyles>({
    chartWrapper: { height: "100%" },
    featurePicker: {
      borderBottom: "1px solid grey",
      display: "flex",
      justifyContent: "space-between",
      padding: "3px 15px"
    },
    iceWrapper: {
      display: "flex",
      flex: 1,
      flexDirection: "column"
    },
    loading: {
      fontSize: "25px",
      margin: "auto",
      padding: "40px"
    },
    parameterSet: {
      display: "flex"
    },
    rangeView: {
      display: "flex",
      justifyContent: "flex-end"
    },
    secondWrapper: {
      flex: 1,
      width: "100%"
    }
  });

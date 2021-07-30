// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IProcessedStyleSet,
  mergeStyleSets,
  IStyle
} from "office-ui-fabric-react";

export interface IMultiIcePlotStyles {
  iceWrapper: IStyle;
  controlArea: IStyle;
  parameterList: IStyle;
  placeholder: IStyle;
  chartWrapper: IStyle;
}

export const multiIcePlotStyles: () => IProcessedStyleSet<IMultiIcePlotStyles> =
  () => {
    return mergeStyleSets<IMultiIcePlotStyles>({
      chartWrapper: {
        flex: "1"
      },
      controlArea: {
        display: "flex",
        justifyContent: "space-between",
        padding: "10px 15px 3px 67px"
      },
      iceWrapper: {
        display: "flex",
        flex: "1",
        flexDirection: "column",
        justifyContent: "stretch"
      },
      parameterList: {
        display: "flex",
        flex: "1"
      },
      placeholder: {
        fontSize: "25px",
        margin: "auto",
        padding: "40px"
      }
    });
  };

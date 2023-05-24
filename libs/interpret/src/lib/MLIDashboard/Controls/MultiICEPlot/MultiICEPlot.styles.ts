// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IProcessedStyleSet, mergeStyleSets, IStyle } from "@fluentui/react";
import { flexMdDown } from "@responsible-ai/core-ui";

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
        padding: "10px 15px 3px 67px",
        selectors: {
          "@media screen and (max-width: 639px)": {
            padding: "10px 15px 3px 0"
          }
        }
      },
      iceWrapper: {
        display: "flex",
        flex: "1",
        flexDirection: "column",
        justifyContent: "stretch",
        width: "80%"
      },
      parameterList: {
        display: "flex",
        flex: "1",
        ...flexMdDown
      },
      placeholder: {
        fontSize: "25px",
        margin: "auto",
        padding: "40px"
      }
    });
  };

// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IStyle,
  mergeStyleSets,
  IProcessedStyleSet,
  getTheme
} from "office-ui-fabric-react";

export interface IShiftCohortStyles {
  filterCircle: IStyle;
  stepBar: IStyle;
}

export const shiftCohortStyles: () => IProcessedStyleSet<IShiftCohortStyles> =
  () => {
    const theme = getTheme();
    return mergeStyleSets<IShiftCohortStyles>({
      filterCircle: {
        backgroundColor: theme.palette.blue,
        borderRadius: "10px",
        boxSizing: "border-box",
        color: theme.palette.blue,
        height: "16px",
        width: "16px"
      },
      stepBar: {
        backgroundColor: theme.palette.neutralTertiaryAlt,
        height: "20px",
        marginBottom: "4px",
        marginLeft: "12px",
        marginTop: "4px",
        width: "2px"
      }
    });
  };

// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IStyle, mergeStyleSets, IProcessedStyleSet } from "@fluentui/react";

import { flexLgDown } from "../../util/getCommonStyles";

export interface ICohortInfoStyles {
  button: IStyle;
  container: IStyle;
  left: IStyle;
}

export const cohortInfoStyles: () => IProcessedStyleSet<ICohortInfoStyles> =
  () => {
    return mergeStyleSets<ICohortInfoStyles>({
      button: {
        minWidth: "120px"
      },
      container: {
        padding: "65px 0 0 20px",
        ...flexLgDown
      },
      left: {
        selectors: {
          "@media screen and (max-width: 1023px)": {
            margin: "25px 30px 0 0"
          }
        }
      }
    });
  };

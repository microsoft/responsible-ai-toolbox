// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IProcessedStyleSet, IStyle, mergeStyleSets } from "@fluentui/react";
import {
  descriptionMaxWidth,
  fullXlDown,
  hideXlDown
} from "@responsible-ai/core-ui";

export interface ICausalIndividualStyles {
  aggregateChart: IStyle;
  callout: IStyle;
  container: IStyle;
  description: IStyle;
  header: IStyle;
  lasso: IStyle;
  individualChart: IStyle;
  individualTable: IStyle;
}

export const CausalIndividualStyles: () => IProcessedStyleSet<ICausalIndividualStyles> =
  () => {
    return mergeStyleSets<ICausalIndividualStyles>({
      aggregateChart: {
        height: "100%",
        width: "80%",
        ...fullXlDown
      },
      callout: {
        margin: "-5px 0 0 -15px"
      },
      container: {
        display: "flex",
        flex: 1,
        flexDirection: "row"
      },
      description: {
        display: "inline-block",
        flex: "1",
        fontSize: 14,
        ...hideXlDown,
        maxWidth: descriptionMaxWidth,
        textAlign: "left"
      },
      header: {
        fontSize: 14,
        fontWeight: "600",
        marginTop: "0px !important"
      },
      individualChart: {
        width: "100%"
      },
      individualTable: {
        marginTop: "0px !important",
        width: "80%",
        ...fullXlDown
      },
      lasso: {
        display: "inline-block",
        flex: "1",
        fontSize: 14,
        paddingTop: "25px",
        textAlign: "left"
      }
    });
  };

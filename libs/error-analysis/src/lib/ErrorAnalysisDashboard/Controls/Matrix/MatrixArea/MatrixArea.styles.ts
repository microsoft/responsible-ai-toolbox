// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IProcessedStyleSet, IStyle, mergeStyleSets } from "@fluentui/react";
import { flexMdDown } from "@responsible-ai/core-ui";

export interface IMatrixAreaStyles {
  emptyLabelPadding: IStyle;
  layerHost: IStyle;
  matrixLabelBottom: IStyle;
  matrixLabelTab: IStyle;
  matrixLabel: IStyle;
  matrixArea: IStyle;
  matrixAreaOptions: IStyle;
}

export const matrixAreaStyles: () => IProcessedStyleSet<IMatrixAreaStyles> =
  () => {
    return mergeStyleSets<IMatrixAreaStyles>({
      emptyLabelPadding: {
        paddingTop: "60px"
      },
      layerHost: {
        height: "500px",
        overflow: "hidden",
        position: "relative"
      },
      matrixArea: {
        paddingBottom: "50px",
        paddingTop: "10px",
        width: "100%"
      },
      matrixAreaOptions: flexMdDown,
      matrixLabel: {
        paddingLeft: "20px"
      },
      matrixLabelBottom: {
        display: "flex",
        flexDirection: "row",
        fontSize: "14px",
        fontStyle: "normal",
        fontWeight: "normal",
        justifyContent: "center",
        paddingBottom: "20px",
        paddingTop: "20px"
      },
      matrixLabelTab: {
        width: "150px"
      }
    });
  };

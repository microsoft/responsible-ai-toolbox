// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  FontSizes,
  FontWeights,
  getTheme,
  IProcessedStyleSet,
  IStyle,
  mergeStyleSets,
  ICalloutContentStyles
} from "@fluentui/react";

import { FluentUIStyles } from "../util/FluentUIStyles";

export interface IAxisControlDialogStyles {
  wrapper: IStyle;
  leftHalf: IStyle;
  rightHalf: IStyle;
  detailedList: IStyle;
  spinButton: IStyle;
  selectButton: IStyle;
  featureText: IStyle;
  filterHeader: IStyle;
  featureComboBox: IStyle;
  treatCategorical: IStyle;
  statsArea: IStyle;
}

export const axisControlDialogStyles: () => IProcessedStyleSet<IAxisControlDialogStyles> =
  () => {
    const theme = getTheme();
    return mergeStyleSets<IAxisControlDialogStyles>({
      detailedList: {
        height: "100%",
        overflowX: "visible",
        width: "100%"
      },
      featureComboBox: {
        height: "56px",
        marginBottom: "10px",
        width: "180px"
      },
      featureText: {
        color: theme.semanticColors.bodySubtext
      },
      filterHeader: {
        color: theme.semanticColors.bodyTextChecked,
        fontSize: FontSizes.medium,
        fontWeight: FontWeights.semibold
      },
      leftHalf: {
        width: "213px"
      },
      rightHalf: {
        background: theme.semanticColors.bodyBackgroundChecked,
        borderRadius: "5px",
        boxSizing: "border-box",
        display: "inline-flex",
        flexDirection: "column",
        marginLeft: "25px",
        padding: "20px 25px",
        width: "255px"
      },
      selectButton: {
        alignSelf: "flex-end",
        height: "32px",
        marginBottom: "15px",
        marginRight: "27px",
        width: "70px"
      },
      spinButton: {
        height: "36px",
        width: "55px"
      },
      statsArea: {
        display: "flex",
        justifyContent: "space-between",
        padding: "3px 20px 3px 0"
      },
      treatCategorical: {
        height: "20px",
        marginBottom: "10px",
        width: "180px"
      },
      wrapper: {
        boxSizing: "border-box",
        display: "flex",
        flex: 1,
        flexDirection: "row",
        padding: "30px 40px 25px 30px",
        width: "100%"
      }
    });
  };

export const axisControlCallout: () => ICalloutContentStyles = () => {
  const theme = getTheme();
  return {
    beak: {},
    beakCurtain: {},
    calloutMain: {
      borderRadius: "2px",
      boxShadow: theme.effects.elevation64,
      display: "flex",
      flexDirection: "column",
      height: "fit-content",
      minHeight: "340px",
      overflowY: "visible",
      width: "560px"
    },
    container: FluentUIStyles.calloutContainer,
    root: {}
  };
};

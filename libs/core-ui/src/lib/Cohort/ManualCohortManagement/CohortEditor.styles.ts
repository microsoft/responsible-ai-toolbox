// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  FontSizes,
  FontWeights,
  getTheme,
  IProcessedStyleSet,
  IStyle,
  mergeStyleSets,
  ICalloutContentStyles,
  ITooltipHostStyles
} from "@fluentui/react";

export interface ICohortEditorStyles {
  wrapper: IStyle;
  leftHalf: IStyle;
  rightHalf: IStyle;
  detailedList: IStyle;
  filterHeader: IStyle;
  addFilterButton: IStyle;
  featureTextDiv: IStyle;
  featureComboBox: IStyle;
  operationComboBox: IStyle;
  valueSpinButton: IStyle;
  valueSpinButtonDiv: IStyle;
  minSpinBox: IStyle;
  maxSpinBox: IStyle;
  featureText: IStyle;
  treatCategorical: IStyle;
  defaultText: IStyle;
  existingFilter: IStyle;
  filterLabel: IStyle;
  defaultFilterList: IStyle;
  container: IStyle;
  addedFilter: IStyle;
  addedFilterDiv: IStyle;
  filterIcon: IStyle;
  cohortName: IStyle;
  deleteCohort: IStyle;
  saveAndCancelDiv: IStyle;
  saveFilterButton: IStyle;
  cancelFilterButton: IStyle;
  closeIcon: IStyle;
  cohortEditor: IStyle;
  saveAndDeleteDiv: IStyle;
  clearFilter: IStyle;
  invalidValueError: IStyle;
}

export const cohortEditorStyles: () => IProcessedStyleSet<ICohortEditorStyles> =
  () => {
    const theme = getTheme();
    return mergeStyleSets<ICohortEditorStyles>({
      addedFilter: {
        color: theme.semanticColors.bodyText,
        fontWeight: FontWeights.semibold,
        height: "30px",
        marginLeft: "45px",
        width: "178px"
      },
      addedFilterDiv: {
        height: "80px",
        marginLeft: "45px",
        marginRight: "40px",
        marginTop: "5px",
        overflowY: "auto"
      },
      addFilterButton: {
        backgroundColor: theme.semanticColors.buttonBackground,
        border: "1px solid",
        borderColor: theme.semanticColors.buttonBorder,
        borderRadius: "2px",
        boxSizing: "border-box",
        height: "32px",
        marginLeft: "32px",
        marginTop: "53px",
        padding: "0px",
        width: "98px"
      },
      cancelFilterButton: {
        height: "32px",
        width: "68px"
      },
      clearFilter: {
        color: theme.semanticColors.severeWarningIcon
      },
      closeIcon: {
        alignSelf: "flex-end",
        color: theme.semanticColors.buttonText,
        height: "32px",
        marginRight: "1px",
        selectors: {
          ":hover": {
            color: theme.semanticColors.buttonTextHovered
          }
        },
        width: "40px"
      },
      cohortEditor: {
        borderRadius: "2px",

        ////elevation64 is used for dialogs/panels
        boxShadow: theme.effects.elevation64,

        height: "610px",

        maxHeight: "610px !important",

        overflowY: "auto",
        width: "560px"
      },
      cohortName: {
        alignSelf: "flex-start",
        height: "56px",
        marginLeft: "37px",
        width: "180px"
      },
      container: {
        display: "flex",
        flexDirection: "column",
        height: "610px",
        overflowY: "auto",
        width: "560px"
      },
      defaultFilterList: {
        color: theme.semanticColors.bodySubtext,
        marginLeft: "10px"
      },
      defaultText: {
        color: theme.semanticColors.bodySubtext,
        marginLeft: "35px",
        marginRight: "35px",
        marginTop: "105px",
        textAlign: "center"
      },
      deleteCohort: {
        borderColor: theme.palette.red,
        color: theme.palette.red,
        selectors: {
          ":active": {
            background: theme.palette.red,
            color: theme.palette.white
          },
          ":hover": {
            background: theme.palette.red,
            color: theme.palette.white
          }
        }
      },
      detailedList: {
        height: "160px",
        marginTop: "28px",
        overflowX: "visible",
        width: "197px"
      },
      existingFilter: {
        border: "1px solid",
        borderColor: theme.semanticColors.link,
        borderRadius: "3px",
        boxSizing: "border-box",
        display: "inline-flex",
        flexDirection: "row",
        height: "25px"
      },
      featureComboBox: {
        height: "56px",
        margin: "21px 45px 1px 30px",
        width: "180px"
      },
      featureText: {
        color: theme.semanticColors.bodySubtext,
        height: "20px",
        marginLeft: "30px",
        textAlign: "left",
        width: "180px"
      },
      featureTextDiv: {
        display: "flex",
        flexDirection: "column",
        marginTop: "3px"
      },
      filterHeader: {
        color: theme.semanticColors.bodyTextChecked,
        fontSize: FontSizes.medium,
        fontWeight: FontWeights.semibold
      },
      filterIcon: {
        height: "25px",
        width: "25px"
      },
      filterLabel: {
        color: theme.semanticColors.link,
        height: "25px",
        maxWidth: "90px",
        minWidth: "75px",
        overflow: "hidden",
        padding: "1px 9px 6px 11px",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap"
      },
      invalidValueError: {
        color: theme.semanticColors.severeWarningIcon,
        fontSize: "12px",
        marginTop: "4px"
      },
      leftHalf: {
        height: "344px",
        marginLeft: "40px",
        width: "213px"
      },
      maxSpinBox: {
        height: "36px",
        width: "64px"
      },
      minSpinBox: {
        height: "36px",
        marginLeft: "30px",
        paddingRight: "26px",
        width: "64px"
      },
      operationComboBox: {
        height: "56px",
        margin: "9px 45px 10px 30px",
        width: "180px"
      },
      rightHalf: {
        background: theme.semanticColors.bodyBackgroundChecked,
        borderRadius: "5px",
        display: "flex",
        flexDirection: "column",
        height: "344px,",
        marginLeft: "25px",
        marginRight: "27px",
        marginTop: "0px",
        width: "255px"
      },
      saveAndCancelDiv: {
        display: "flex",
        flexDirection: "row",
        marginLeft: "32px",
        marginTop: "53px"
      },
      saveAndDeleteDiv: {
        display: "flex",
        flexDirection: "row",
        marginTop: "18px"
      },
      saveFilterButton: {
        height: "32px",
        marginRight: "15px",
        width: "68px"
      },
      treatCategorical: {
        height: "20px",
        margin: "9px 45px 1px 30px",
        width: "180px"
      },
      valueSpinButton: {
        height: "36px",
        marginLeft: "30px",
        marginRight: "45px",
        width: "180px"
      },
      valueSpinButtonDiv: {
        display: "flex",
        flexDirection: "row",
        marginTop: "10px"
      },
      wrapper: {
        display: "flex",
        height: "344px",
        marginTop: "7px"
      }
    });
  };

export const tooltipHostStyles: Partial<ITooltipHostStyles> = {
  root: { display: "block" }
};

const cohortEditor = cohortEditorStyles();
export const cohortEditorCallout: () => ICalloutContentStyles = () => {
  return {
    beak: {},
    beakCurtain: {},
    calloutMain: cohortEditor.cohortEditor,
    container: {
      zIndex: 15
    },
    root: {
      top: "-22px !important"
    }
  };
};

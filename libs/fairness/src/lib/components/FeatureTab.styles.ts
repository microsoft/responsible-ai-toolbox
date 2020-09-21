// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  getTheme,
  IProcessedStyleSet,
  IStyle,
  mergeStyleSets,
  FontSizes,
  FontWeights
} from "office-ui-fabric-react";

export interface IFeatureTabStyles {
  itemCell: IStyle;
  iconClass: IStyle;
  itemsList: IStyle;
  frame: IStyle;
  main: IStyle;
  header: IStyle;
  textBody: IStyle;
  tableHeader: IStyle;
  itemTitle: IStyle;
  valueCount: IStyle;
  iconWrapper: IStyle;
  featureDescriptionSection: IStyle;
  binSection: IStyle;
  expandButton: IStyle;
  category: IStyle;
  subgroupHeader: IStyle;
}

export const FeatureTabStyles: () => IProcessedStyleSet<
  IFeatureTabStyles
> = () => {
  const theme = getTheme();
  return mergeStyleSets<IFeatureTabStyles>({
    binSection: {
      width: "130px"
    },
    category: {
      color: theme.semanticColors.bodyText,
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap"
    },
    expandButton: {
      paddingLeft: 0,
      selectors: {
        "& i": {
          marginLeft: 0
        }
      }
    },
    featureDescriptionSection: {
      flex: 1,
      minHeight: "75px",
      paddingRight: "20px"
    },
    frame: {
      height: "100%"
    },
    header: {
      color: theme.semanticColors.bodyText,
      fontWeight: FontWeights.semibold,
      margin: "26px 0"
    },
    iconClass: {
      color: theme.semanticColors.accentButtonBackground,
      fontSize: FontSizes.large
    },
    iconWrapper: {
      paddingLeft: "5px",
      paddingTop: "4px",
      width: "30px"
    },
    itemCell: {
      borderBottom: "1px solid",
      borderBottomColor: theme.semanticColors.bodyDivider,
      boxSizing: "border-box",
      cursor: "pointer",
      display: "flex",
      flexDirection: "row",
      padding: "20px 0",
      selectors: {
        "&:hover": {
          background: theme.semanticColors.listItemBackgroundHovered
        }
      },
      width: "100%"
    },
    itemTitle: {
      color: theme.semanticColors.listText,
      margin: 0
    },
    itemsList: {
      overflowY: "auto"
    },
    main: {
      flex: 1,
      height: "100%",
      maxWidth: "700px"
    },
    subgroupHeader: {
      width: "130px"
    },
    tableHeader: {
      borderBottom: "1px solid",
      borderColor: theme.semanticColors.bodyDivider,
      color: theme.semanticColors.bodyText,
      display: "flex",
      flexDirection: "row",
      justifyContent: "space-between",
      paddingBottom: "15px"
    },
    textBody: {
      color: theme.semanticColors.bodyText,
      fontWeight: FontWeights.semilight,
      paddingTop: "12px"
    },
    valueCount: {
      color: theme.semanticColors.bodyText,
      paddingTop: "15px"
    }
  });
};

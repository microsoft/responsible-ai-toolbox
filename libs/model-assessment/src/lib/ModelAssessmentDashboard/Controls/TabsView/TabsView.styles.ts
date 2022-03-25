// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IStyle,
  mergeStyleSets,
  IProcessedStyleSet,
  getTheme
} from "office-ui-fabric-react";

export interface ITabsViewStyles {
  section: IStyle;
  sectionHeader: IStyle;
  buttonSection: IStyle;
}

export const tabsViewStyles: () => IProcessedStyleSet<ITabsViewStyles> = () => {
  const theme = getTheme();
  return mergeStyleSets<ITabsViewStyles>({
    buttonSection: {
      textAlign: "center"
    },
    section: {
      textAlign: "left"
    },
    sectionHeader: {
      color: theme.semanticColors.bodyText,
      padding: "16px 24px 16px 40px"
    }
  });
};

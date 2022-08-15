// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { mergeStyleSets, IStyle, IProcessedStyleSet } from "@fluentui/react";

export interface ICohortListStyles {
  link: IStyle;
}

export const cohortListStyles = (): IProcessedStyleSet<ICohortListStyles> => {
  return mergeStyleSets<ICohortListStyles>({
    link: {
      fontSize: "14px"
    }
  });
};

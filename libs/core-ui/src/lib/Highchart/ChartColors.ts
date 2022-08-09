// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ITheme } from "@fluentui/react";

import { FluentUIStyles, IColorNames } from "../util/FluentUIStyles";

export function getPrimaryChartColor(theme: ITheme): string {
  return theme.semanticColors.link;
}

export function getPrimaryBackgroundChartColor(theme: ITheme): string {
  return theme.semanticColors.bodyBackground;
}

export function getChartColorsMap(
  theme: ITheme
): Map<keyof IColorNames, string> {
  return FluentUIStyles.getColorsMap(theme);
}

export function getChartColors(theme: ITheme): string[] {
  return FluentUIStyles.getFlunetUIPalette(theme);
}

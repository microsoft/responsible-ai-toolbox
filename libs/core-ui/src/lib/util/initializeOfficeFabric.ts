// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  createTheme,
  initializeIcons as fabricInit,
  ITheme,
  loadTheme
} from "@fluentui/react";

export const defaultTheme: ITheme = createTheme({
  palette: {
    black: "#000000",
    neutralDark: "#201f1e",
    neutralLight: "#edebe9",
    neutralLighter: "#f3f2f1",
    neutralLighterAlt: "#faf9f8",
    neutralPrimary: "#323130",
    neutralPrimaryAlt: "#3b3a39",
    neutralQuaternary: "#d0d0d0",
    neutralQuaternaryAlt: "#e1dfdd",
    neutralSecondary: "#605e5c",
    neutralTertiary: "#a19f9d",
    neutralTertiaryAlt: "#c8c6c4",
    themeDark: "#005a9e",
    themeDarkAlt: "#106ebe",
    themeDarker: "#004578",
    themeLight: "#c7e0f4",
    themeLighter: "#deecf9",
    themeLighterAlt: "#eff6fc",
    themePrimary: "#0078d4",
    themeSecondary: "#2b88d8",
    themeTertiary: "#71afe5",
    white: "#ffffff"
  }
});

export interface IOfficeFabricProps {
  shouldInitializeIcons?: boolean;
  iconUrl?: string;
  theme?: ITheme;
}

export function initializeOfficeFabric(props: IOfficeFabricProps): void {
  if (props.shouldInitializeIcons !== false) {
    fabricInit(props.iconUrl);
  }
  loadTheme(props.theme || defaultTheme);
}

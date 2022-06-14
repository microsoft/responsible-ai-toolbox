// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { createTheme } from "@fluentui/react";

const darkTheme = createTheme({
  palette: {
    black: "#f8f8f8",
    neutralDark: "#f4f4f4",
    neutralLight: "#343434",
    neutralLighter: "#252525",
    neutralLighterAlt: "#1c1c1c",
    neutralPrimary: "#ffffff",
    neutralPrimaryAlt: "#dadada",
    neutralQuaternary: "#454545",
    neutralQuaternaryAlt: "#3d3d3d",
    neutralSecondary: "#d0d0d0",
    neutralTertiary: "#c8c8c8",
    neutralTertiaryAlt: "#656565",
    themeDark: "#1e74ba",
    themeDarkAlt: "#2389dc",
    themeDarker: "#165589",
    themeLight: "#bcdffc",
    themeLighter: "#dbeefd",
    themeLighterAlt: "#f6fbff",
    themePrimary: "#2899f5",
    themeSecondary: "#40a4f6",
    themeTertiary: "#7bc0f9",
    white: "#121212"
  }
});

const lightTheme = createTheme({
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

const darkContrastTheme = createTheme({
  palette: {
    black: "#f8f8f8",
    neutralDark: "#f4f4f4",
    neutralLight: "#343434",
    neutralLighter: "#252525",
    neutralLighterAlt: "#1c1c1c",
    neutralPrimary: "#ffffff",
    neutralPrimaryAlt: "#dadada",
    neutralQuaternary: "#454545",
    neutralQuaternaryAlt: "#3d3d3d",
    neutralSecondary: "#d0d0d0",
    neutralTertiary: "#c8c8c8",
    neutralTertiaryAlt: "#656565",
    themeDark: "#c2c200",
    themeDarkAlt: "#e6e600",
    themeDarker: "#8f8f00",
    themeLight: "#ffffb3",
    themeLighter: "#ffffd6",
    themeLighterAlt: "#fffff5",
    themePrimary: "#ffff00",
    themeSecondary: "#ffff1f",
    themeTertiary: "#ffff66",
    white: "#000000"
  }
});

export const themes = <const>{
  "1 - light": lightTheme,
  "2 - dark": darkTheme,
  "3 - darkHiContrast": darkContrastTheme
};

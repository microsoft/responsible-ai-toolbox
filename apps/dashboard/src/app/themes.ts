import { createTheme } from "office-ui-fabric-react";

const darkTheme = createTheme({
  palette: {
    themePrimary: "#2899f5",
    themeLighterAlt: "#f6fbff",
    themeLighter: "#dbeefd",
    themeLight: "#bcdffc",
    themeTertiary: "#7bc0f9",
    themeSecondary: "#40a4f6",
    themeDarkAlt: "#2389dc",
    themeDark: "#1e74ba",
    themeDarker: "#165589",
    neutralLighterAlt: "#1c1c1c",
    neutralLighter: "#252525",
    neutralLight: "#343434",
    neutralQuaternaryAlt: "#3d3d3d",
    neutralQuaternary: "#454545",
    neutralTertiaryAlt: "#656565",
    neutralTertiary: "#c8c8c8",
    neutralSecondary: "#d0d0d0",
    neutralPrimaryAlt: "#dadada",
    neutralPrimary: "#ffffff",
    neutralDark: "#f4f4f4",
    black: "#f8f8f8",
    white: "#121212"
  }
});

const lightTheme = createTheme({
  palette: {
    themePrimary: "#0078d4",
    themeLighterAlt: "#eff6fc",
    themeLighter: "#deecf9",
    themeLight: "#c7e0f4",
    themeTertiary: "#71afe5",
    themeSecondary: "#2b88d8",
    themeDarkAlt: "#106ebe",
    themeDark: "#005a9e",
    themeDarker: "#004578",
    neutralLighterAlt: "#faf9f8",
    neutralLighter: "#f3f2f1",
    neutralLight: "#edebe9",
    neutralQuaternaryAlt: "#e1dfdd",
    neutralQuaternary: "#d0d0d0",
    neutralTertiaryAlt: "#c8c6c4",
    neutralTertiary: "#a19f9d",
    neutralSecondary: "#605e5c",
    neutralPrimaryAlt: "#3b3a39",
    neutralPrimary: "#323130",
    neutralDark: "#201f1e",
    black: "#000000",
    white: "#ffffff"
  }
});

const darkContrastTheme = createTheme({
  palette: {
    themePrimary: "#ffff00",
    themeLighterAlt: "#fffff5",
    themeLighter: "#ffffd6",
    themeLight: "#ffffb3",
    themeTertiary: "#ffff66",
    themeSecondary: "#ffff1f",
    themeDarkAlt: "#e6e600",
    themeDark: "#c2c200",
    themeDarker: "#8f8f00",
    neutralLighterAlt: "#1c1c1c",
    neutralLighter: "#252525",
    neutralLight: "#343434",
    neutralQuaternaryAlt: "#3d3d3d",
    neutralQuaternary: "#454545",
    neutralTertiaryAlt: "#656565",
    neutralTertiary: "#c8c8c8",
    neutralSecondary: "#d0d0d0",
    neutralPrimaryAlt: "#dadada",
    neutralPrimary: "#ffffff",
    neutralDark: "#f4f4f4",
    black: "#f8f8f8",
    white: "#000000"
  }
});

export const themes = <const>{
  light: lightTheme,
  dark: darkTheme,
  darkHiContrast: darkContrastTheme
};

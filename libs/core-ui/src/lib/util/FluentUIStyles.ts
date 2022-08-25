// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IComboBoxStyles,
  ICalloutProps,
  IPivotStyles,
  FontWeights,
  mergeStyles,
  ITextFieldStyles,
  IStyle,
  getTheme,
  mergeStyleSets,
  ITheme
} from "@fluentui/react";

export interface IColorNames {
  black: string;
  blueMid: string;
  magentaDark: string;
  magentaLight: string;
  neutral: string;
  orangeLighter: string;
  primary: string;
  primaryLight: string;
  purple: string;
  purpleLight: string;
  red: string;
  redDark: string;
  teal: string;
}

export interface IRGBColor {
  r: number;
  g: number;
  b: number;
}

export class FluentUIStyles {
  public static limitedSizeMenuDropdown: Partial<IComboBoxStyles> = {
    callout: {
      maxHeight: "256px",
      minWidth: "200px"
    },
    optionsContainerWrapper: {
      maxHeight: "256px",
      minWidth: "200px"
    }
  };

  public static defaultDropdownStyle: Partial<IComboBoxStyles> = mergeStyleSets<
    Partial<IComboBoxStyles>,
    Partial<IComboBoxStyles>
  >(
    {
      container: {
        width: "100%"
      }
    },
    FluentUIStyles.limitedSizeMenuDropdown
  );

  public static smallDropdownStyle: Partial<IComboBoxStyles> = mergeStyleSets<
    Partial<IComboBoxStyles>,
    Partial<IComboBoxStyles>
  >(
    {
      callout: {
        maxHeight: "256px",
        minWidth: "200px"
      },
      container: {
        display: "inline-flex",
        flexWrap: "wrap",
        width: "150px"
      },
      label: {
        paddingRight: "10px"
      },
      optionsContainerWrapper: {
        maxHeight: "256px",
        minWidth: "200px"
      },
      root: {
        flex: 1,
        minWidth: "150px"
      }
    },
    FluentUIStyles.limitedSizeMenuDropdown
  );

  public static calloutWrapper: IStyle = {
    width: "300px"
  };

  public static calloutHeader: IStyle = {
    padding: "18px 24px 12px"
  };

  public static calloutTitle: IStyle = [
    getTheme().fonts.xLarge,
    {
      fontWeight: FontWeights.semilight,
      margin: 0
    }
  ];
  public static calloutInner: IStyle = {
    height: "100%",
    padding: "0 24px 20px"
  };

  public static chartEditorButton: IStyle = {
    backgroundColor: getTheme().semanticColors.accentButtonBackground,
    borderColor: getTheme().semanticColors.buttonBorder,
    borderStyle: "solid",
    borderWidth: "1px",
    color: getTheme().semanticColors.accentButtonText
  };

  public static calloutContainer: IStyle = {
    zIndex: 10
  };

  public static calloutProps: ICalloutProps = {
    doNotLayer: true,
    styles: {
      calloutMain: {
        maxHeight: "400px"
      },
      container: mergeStyles([
        FluentUIStyles.calloutContainer,
        {
          position: "fixed"
        }
      ])
    }
  };

  public static placeholderItalic: IStyle = {
    color: getTheme().semanticColors.disabledBodyText,
    fontStyle: "italic",
    padding: "0 0 5px 5px"
  };

  public static orderedColorNames: string[] = [
    "primary",
    "orangeLighter",
    "magentaDark",
    "teal",
    "purpleLight",
    "neutral",
    "redDark",
    "purple",
    "magentaLight",
    "black",
    "red",
    "blueMid",
    "primaryLight"
  ];

  public static fluentUIColorPalette: string[] =
    FluentUIStyles.getFlunetUIPalette(getTheme());
  public static scatterFluentUIColorPalette: string[] =
    FluentUIStyles.getScatterFluentUIPalette(getTheme());
  public static plotlyColorHexPalette: string[] =
    FluentUIStyles.getFlunetUIPalette(getTheme());
  public static plotlyColorPalette: IRGBColor[] =
    FluentUIStyles.plotlyColorHexPalette.map((hex) =>
      FluentUIStyles.hex2rgb(hex)
    );

  public static fabricColorInactiveSeries = "#949494";

  public static chartAxisColor = "#979797";
  public static fontFamilies =
    "Segoe UI, Segoe UI Web (West European),  Roboto, Helvetica Neue, sans-serif";

  public static verticalTabsStyle: Partial<IPivotStyles> = {
    link: {
      backgroundColor: "#f4f4f4",
      flex: 1,
      selectors: {
        "&:focus, &:focus:not(:last-child)": {
          border: "3px solid rgb(102, 102, 102)"
        },
        "&:not(:last-child)": {
          borderBottom: "1px solid grey"
        },
        ".ms-Button-flexContainer": {
          justifyContent: "center"
        }
      }
    },
    linkIsSelected: {
      flex: 1,
      selectors: {
        "&:focus, &:focus:not(:last-child)": {
          border: "3px solid rgb(235, 235, 235)"
        },
        "&:not(:last-child)": {
          borderBottom: "1px solid grey"
        },
        ".ms-Button-flexContainer": {
          justifyContent: "center"
        }
      }
    },
    root: {
      display: "flex",
      flexDirection: "column",
      height: "100%",
      width: "100px"
    },
    text: {
      lineHeight: "28px",
      whiteSpace: "normal"
    }
  };

  public static textFieldStyle: Partial<ITextFieldStyles> = {
    root: {
      minWidth: "150px",
      padding: "0 5px"
    },
    subComponentStyles: {
      label: {
        padding: "5px 10px 0 10px"
      }
    },
    wrapper: {
      display: "inline-flex"
    }
  };

  public static hex2rgb(hex: string): IRGBColor {
    const bigint = Number.parseInt(hex, 16);
    const rv = (bigint >> 16) & 255;
    const gv = (bigint >> 8) & 255;
    const bv = bigint & 255;

    return { b: bv, g: gv, r: rv };
  }

  public static getFlunetUIPalette(theme: ITheme): string[] {
    const colorsMap = FluentUIStyles.getColorsMap(theme);
    return FluentUIStyles.orderedColorNames.map(
      (colorName) =>
        colorsMap.get(colorName as keyof IColorNames) ??
        FluentUIStyles.fluentUIColorPalette[0]
    );
  }

  public static getScatterFluentUIPalette(theme: ITheme): string[] {
    const colors = [];
    for (let i = 0; i < 5; i++) {
      colors.push(
        theme.palette.magentaDark,
        theme.palette.orangeLighter,
        theme.palette.teal
      );
    }
    return colors;
  }

  public static getColorsMap(theme: ITheme): Map<keyof IColorNames, string> {
    const {
      black,
      blueMid,
      magentaDark,
      magentaLight,
      neutralSecondaryAlt,
      orangeLighter,
      purple,
      purpleLight,
      red,
      redDark,
      teal,
      themeLight,
      themePrimary
    } = theme.palette;

    const nameToColor = new Map<keyof IColorNames, string>([
      ["black", black],
      ["blueMid", blueMid],
      ["magentaDark", magentaDark],
      ["magentaLight", magentaLight],
      ["neutral", neutralSecondaryAlt],
      ["orangeLighter", orangeLighter],
      ["primary", themePrimary],
      ["primaryLight", themeLight],
      ["purple", purple],
      ["purpleLight", purpleLight],
      ["red", red],
      ["redDark", redDark],
      ["teal", teal]
    ]);
    return nameToColor;
  }
}

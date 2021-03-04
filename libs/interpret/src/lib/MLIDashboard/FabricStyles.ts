// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IComboBoxStyles,
  IPivotStyles,
  FontWeights,
  ICalloutProps,
  mergeStyles,
  ITextFieldStyles,
  IStyle,
  getTheme,
  mergeStyleSets
} from "office-ui-fabric-react";

export interface IRGBColor {
  r: number;
  g: number;
  b: number;
}

export class FabricStyles {
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
    FabricStyles.limitedSizeMenuDropdown
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
    FabricStyles.limitedSizeMenuDropdown
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
        FabricStyles.calloutContainer,
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

  public static plotlyColorPalette: IRGBColor[] = [
    { b: 180, g: 119, r: 31 }, // muted blue
    { b: 14, g: 127, r: 255 }, // safety orange
    { b: 44, g: 160, r: 44 }, // cooked asparagus green
    { b: 40, g: 39, r: 214 }, // brick red
    { b: 189, g: 103, r: 148 }, // muted purple
    { b: 75, g: 86, r: 140 }, // chestnut brown
    { b: 194, g: 119, r: 227 }, // raspberry yogurt pink
    { b: 127, g: 127, r: 127 }, // middle gray
    { b: 34, g: 189, r: 188 }, // curry yellow-green
    { b: 207, g: 190, r: 23 } // blue-teal
  ];

  public static plotlyColorHexPalette: string[] = [
    "#1f77b4", // muted blue
    "#ff7f0e", // safety orange
    "#2ca02c", // cooked asparagus green
    "#d62728", // brick red
    "#9467bd", // muted purple
    "#8c564b", // chestnut brown
    "#e377c2", // raspberry yogurt pink
    "#7f7f7f", // middle gray
    "#bcbd22", // curry yellow-green
    "#17becf" // blue-teal
  ];

  // public static fabricColorPalette: string[] = [
  //     "#0078d4",
  //     "#00188f",
  //     "#00A2ad",
  //     "#4b003f",
  //     "#917edb",
  //     "#001d3f",
  //     "#e3008c",
  //     "#022f22",
  //     "#ef6950",
  //     "#502006"
  // ];

  public static fabricColorPalette: string[] = [
    "#1f77b4", // muted blue
    "#ff7f0e", // safety orange
    "#2ca02c", // cooked asparagus green
    "#d62728", // brick red
    "#9467bd", // muted purple
    "#8c564b", // chestnut brown
    "#e377c2", // raspberry yogurt pink
    "#7f7f7f", // middle gray
    "#bcbd22", // curry yellow-green
    "#17becf" // blue-teal
  ];

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
}

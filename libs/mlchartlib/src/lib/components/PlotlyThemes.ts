// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ITheme } from "@fluentui/react";
import _ from "lodash";

import { IPlotlyProperty } from "./IPlotlyProperty";

export interface IPlotlyTheme {
  axisColor: string;
  axisGridColor: string;
  backgroundColor: string;
  fontColor: string;
}

const plotlyLightTheme: IPlotlyTheme = {
  axisColor: "#444",
  axisGridColor: "#eee",
  backgroundColor: "#fff",
  fontColor: "#000"
};

const plotlyDarkTheme: IPlotlyTheme = {
  axisColor: "#aaa",
  axisGridColor: "#222",
  backgroundColor: "#000",
  fontColor: "#fff"
};

const plotlyWhiteTheme: IPlotlyTheme = {
  axisColor: "#000",
  axisGridColor: "#000",
  backgroundColor: "#fff",
  fontColor: "#000"
};

const plotlyBlackTheme: IPlotlyTheme = {
  axisColor: "#fff",
  axisGridColor: "#fff",
  backgroundColor: "#000",
  fontColor: "#fff"
};

export class PlotlyThemes {
  public static applyTheme(
    props: IPlotlyProperty,
    theme?: string | ITheme,
    themeOverride?: Partial<IPlotlyTheme>
  ): IPlotlyProperty {
    const newProps = _.cloneDeep(props);

    const plotTheme = _.merge(this.getTheme(theme), themeOverride);

    _.set(newProps, "layout.font.color", plotTheme.fontColor);
    _.set(newProps, "layout.paper_bgcolor", plotTheme.backgroundColor);
    _.set(newProps, "layout.plot_bgcolor", plotTheme.backgroundColor);
    _.set(newProps, "layout.xaxis.color", plotTheme.axisColor);
    _.set(newProps, "layout.yaxis.color", plotTheme.axisColor);
    _.set(newProps, "layout.xaxis.gridcolor", plotTheme.axisGridColor);
    _.set(newProps, "layout.yaxis.gridcolor", plotTheme.axisGridColor);

    return newProps;
  }

  private static getTheme(theme?: string | ITheme): IPlotlyTheme {
    if (typeof theme === "string" || theme === undefined) {
      switch (theme) {
        case undefined:
        case "light":
          return plotlyLightTheme;
        case "dark":
          return plotlyDarkTheme;
        case "white":
          return plotlyWhiteTheme;
        case "black":
          return plotlyBlackTheme;
        default:
          return plotlyLightTheme;
      }
    }
    return _.defaults(
      {
        axisColor: theme.semanticColors.bodyText,
        axisGridColor: theme.semanticColors.bodySubtext,
        backgroundColor: theme.semanticColors.bodyBackground,
        fontColor: theme.semanticColors.bodyText
      },
      plotlyLightTheme
    );
  }
}

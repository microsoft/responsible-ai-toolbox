// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Text } from "@fluentui/react";
import React from "react";

import { interactiveLegendStyles } from "./InteractiveLegend.styles";
import { InteractiveLegendClickButton } from "./InteractiveLegendClickButton";
import { InteractiveLegendEditAndDeleteButton } from "./InteractiveLegendEditAndDeleteButton";

export enum SortingState {
  Ascending = "ascending",
  Descending = "descending",
  None = "none"
}

export interface ILegendItem {
  disabled?: boolean;
  disabledMessage?: string;
  activated: boolean;
  index: number;
  sortingState?: SortingState;
  color: string;
  name: string;
  onClick?: (index: number) => void;
  onDelete?: (index: number) => void;
  onEdit?: (index: number) => void;
}

export interface IInteractiveLegendProps {
  items: ILegendItem[];
}

export class InteractiveLegend extends React.PureComponent<IInteractiveLegendProps> {
  private readonly classes = interactiveLegendStyles();

  public render(): React.ReactNode {
    return (
      <div id="iterative-container" className={this.classes.root}>
        {this.props.items.map((item, index) => {
          return this.buildRowElement(item, index);
        })}
      </div>
    );
  }

  private buildRowElement(item: ILegendItem, index: number): React.ReactNode {
    const colorBoxClassName = this.getColorBoxCss(
      index,
      item.color,
      !item.disabled
    );
    if (item.disabled) {
      return (
        <div
          className={this.classes.disabledItem}
          title={item.disabledMessage || ""}
          key={index}
        >
          <div className={colorBoxClassName} />
          <Text nowrap variant={"medium"} className={this.classes.label}>
            {item.name}
          </Text>
          <InteractiveLegendEditAndDeleteButton
            index={item.index}
            onDelete={item.onDelete}
            onEdit={item.onEdit}
          />
        </div>
      );
    }
    const rootClass =
      item.activated === false ? this.classes.inactiveItem : this.classes.item;
    return (
      <div className={rootClass} key={index}>
        <InteractiveLegendClickButton
          activated={item.activated}
          index={index}
          name={item.name}
          colorBoxClassName={colorBoxClassName}
          onClick={item.onClick}
        />
        <InteractiveLegendEditAndDeleteButton
          index={item.index}
          onDelete={item.onDelete}
          onEdit={item.onEdit}
        />
      </div>
    );
  }

  private getColorBoxCss = (
    index: number,
    color?: string,
    activated?: boolean
  ): string => {
    const classes = interactiveLegendStyles(activated, color);
    // this is used as data series symbol in the side panel, the sequence needs to be consist with the sequence of symbols in ScatterUtils getScatterSymbols()
    switch (true) {
      case index % 5 === 0:
        return classes.circleColorBox;
      case index % 5 === 1:
        return classes.squareColorBox;
      case index % 5 === 2:
        return classes.diamondColorBox;
      case index % 5 === 3:
        return classes.triangleColorBox;
      case index % 5 === 4:
        return classes.triangleDownColorBox;
      default:
        return classes.circleColorBox;
    }
  };
}

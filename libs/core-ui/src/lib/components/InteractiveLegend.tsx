// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Text } from "@fluentui/react";
import React from "react";

import { interactiveLegendStyles } from "./InteractiveLegend.styles";
import { InteractiveLegendClickButton } from "./InteractiveLegendClickButton";
import { InteractiveLegendEditAndDeleteButton } from "./InteractiveLegendEditAndDeleteButton";
import { getColorBoxClassName } from "./InteractiveLegendUtils";

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
    const colorBoxClassName = getColorBoxClassName(
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
}

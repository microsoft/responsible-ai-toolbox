import React from "react";
import { IconButton, Text } from "office-ui-fabric-react";
import { interactiveLegendStyles } from "./InteractiveLegend.styles";

export enum SortingState {
  Ascending = "ascending",
  Descending = "descending",
  None = "none"
}

export interface ILegendItem {
  disabled?: boolean;
  disabledMessage?: string;
  activated: boolean;
  sortingState?: SortingState;
  color: string;
  name: string;
  onClick: () => void;
  onDelete?: () => void;
  onEdit?: () => void;
}

export interface IInteractiveLegendProps {
  items: ILegendItem[];
}

export class InteractiveLegend extends React.PureComponent<
  IInteractiveLegendProps
> {
  private readonly classes = interactiveLegendStyles();

  public render(): React.ReactNode {
    return (
      <div className={this.classes.root}>
        {this.props.items.map((item, index) => {
          return this.buildRowElement(item, index);
        })}
      </div>
    );
  }

  private buildRowElement(item: ILegendItem, index: number): React.ReactNode {
    if (item.disabled) {
      return (
        <div
          className={this.classes.disabledItem}
          title={item.disabledMessage || ""}
          key={index}
        >
          <div className={this.classes.inactiveColorBox} />
          <Text nowrap variant={"medium"} className={this.classes.label}>
            {item.name}
          </Text>
          {item.onEdit !== undefined && (
            <IconButton
              className={this.classes.editButton}
              iconProps={{ iconName: "Edit" }}
              onClick={item.onEdit}
            />
          )}
          {item.onDelete !== undefined && (
            <IconButton
              className={this.classes.deleteButton}
              iconProps={{ iconName: "Clear" }}
              onClick={item.onDelete}
            />
          )}
        </div>
      );
    }
    const rootClass =
      item.activated === false ? this.classes.inactiveItem : this.classes.item;
    return (
      <div className={rootClass} key={index}>
        <div className={this.classes.clickTarget} onClick={item.onClick}>
          <div
            className={
              item.activated === false
                ? this.classes.inactiveColorBox
                : this.classes.colorBox
            }
            style={{ backgroundColor: item.color }}
          />
          <Text nowrap variant={"medium"} className={this.classes.label}>
            {item.name}
          </Text>
        </div>
        {item.onEdit !== undefined && (
          <IconButton
            className={this.classes.editButton}
            iconProps={{ iconName: "Edit", style: { fontSize: "10px" } }}
            onClick={item.onEdit}
          />
        )}
        {item.onDelete !== undefined && (
          <IconButton
            className={this.classes.deleteButton}
            iconProps={{ iconName: "Clear", style: { fontSize: "10px" } }}
            onClick={item.onDelete}
          />
        )}
      </div>
    );
  }
}

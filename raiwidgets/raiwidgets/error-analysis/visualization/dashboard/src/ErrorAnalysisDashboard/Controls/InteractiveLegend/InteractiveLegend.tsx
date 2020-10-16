import React from "react";
import { interactiveLegendStyles } from "./InteractiveLegend.styles";
import { IconButton, ITheme, Text } from "office-ui-fabric-react";

export enum SortingState {
  ascending = "ascending",
  descending = "descending",
  none = "none"
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
          return this.buildRowElement(item);
        })}
      </div>
    );
  }

  private buildRowElement(item: ILegendItem): React.ReactNode {
    if (item.disabled) {
      return (
        <div
          className={this.classes.disabledItem}
          title={item.disabledMessage || ""}
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
      <div className={rootClass}>
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

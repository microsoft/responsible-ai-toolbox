// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  CheckboxVisibility,
  DetailsList,
  FontWeights,
  IGroup,
  IObjectWithKey,
  Selection,
  SelectionMode,
  TooltipHost,
  TooltipOverflowMode,
  Text
} from "@fluentui/react";
import { localization } from "@responsible-ai/localization";
import React from "react";

import { performanceOptions } from "./../util/PerformanceMetrics";

export interface ISelectionItemProps extends IObjectWithKey {
  name: string;
  metric: string;
  description?: string;
  onSelect: (newKey: string) => void;
  key: string;
}

export interface ISelectionListProps {
  items: ISelectionItemProps[];
  grouped: boolean;
  defaultSelectedKey: string;
}

export class SelectionList extends React.Component<ISelectionListProps> {
  private _selection: Selection = new Selection({
    onSelectionChanged: (): void => {
      if (this._selection !== undefined) {
        const selectedItems = this._selection.getSelection();
        if (selectedItems.length > 0) {
          // There cannot be more than one selected item.
          (selectedItems[0] as ISelectionItemProps).onSelect(
            (selectedItems[0] as ISelectionItemProps).key
          );
        }
      }
    }
  });
  private _sortedItems: ISelectionItemProps[] = [];
  private _groups: IGroup[] = [];
  private _columns = [
    {
      fieldName: "name",
      isResizable: true,
      key: "name",
      maxWidth: 200,
      minWidth: 100,
      name: "Name",
      onRender: (item: any): React.ReactNode => {
        return (
          <Text block styles={{ root: { fontWeight: FontWeights.semibold } }}>
            {item.name}
          </Text>
        );
      }
    },
    {
      fieldName: "description",
      key: "description",
      maxWidth: 200,
      minWidth: 100,
      name: "Description",
      onRender: (item: any): React.ReactNode => {
        // This custom render function adds a TooltipHost to show the tooltip
        // with the item description when the parent element overflows.
        return (
          <TooltipHost
            id={item.key}
            content={item.description}
            overflowMode={TooltipOverflowMode.Parent}
          >
            <Text>{item.description}</Text>
          </TooltipHost>
        );
      }
    }
  ];

  public constructor(props: ISelectionListProps) {
    super(props);

    let previousGroup = "";

    // sort alphabetically so that entries with metrics from the same
    // group are grouped together
    this._sortedItems = this.props.items.sort((a, b) => {
      const groupA = this.getGroupFromMetric(a.metric);
      const groupB = this.getGroupFromMetric(b.metric);
      if (groupA > groupB) {
        return 1;
      }
      if (groupA < groupB) {
        return -1;
      }
      return 0;
    });

    this._sortedItems.forEach((item, index) => {
      if (this.props.grouped) {
        const groupName = this.getGroupFromMetric(item.metric);

        if (previousGroup === groupName) {
          // update last group by increasing count
          this._groups[this._groups.length - 1].count += 1;
        } else {
          // create new group
          previousGroup = groupName;
          this._groups.push({
            count: 1,
            isCollapsed: true,
            key: item.metric,
            level: 0,
            name: groupName,
            startIndex: index
          });
        }

        // don't collapse if the default selection is in this group
        if (item.key === this.props.defaultSelectedKey) {
          this._groups[this._groups.length - 1].isCollapsed = false;
        }
      }
      item.description = item.description ?? "";
    });
  }

  public render(): React.ReactNode {
    // to set the default metric first disable change events, then re-enable them
    this._selection.setChangeEvents(false, true);
    this._selection.setItems(this._sortedItems);
    this._selection.setKeySelected(this.props.defaultSelectedKey, true, false);
    this._selection.setChangeEvents(true, true);

    const commonArgs = {
      ariaLabelForSelectionColumn: "Toggle selection",
      checkboxVisibility: CheckboxVisibility.always,
      checkButtonAriaLabel: "Row checkbox",
      columns: this._columns,
      compact: true,
      isHeaderVisible: false,
      items: this._sortedItems,
      selection: this._selection,
      selectionMode: SelectionMode.single
    };
    if (this.props.grouped) {
      return (
        <DetailsList
          {...commonArgs}
          groups={this._groups}
          groupProps={{
            showEmptyGroups: false
          }}
        />
      );
    }
    return <DetailsList {...commonArgs} />;
  }

  private getGroupFromMetric(metric: string): string {
    if (metric === "") {
      // complex metric based on more than one performance metric: equalized odds
      return localization.Fairness.Metrics.Groups.equalizedOdds;
    }
    if (!Object.keys(performanceOptions).includes(metric)) {
      // custom defined metric
      return localization.Fairness.Metrics.Groups.custom;
    }
    return performanceOptions[metric].group;
  }
}

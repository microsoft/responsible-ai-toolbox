// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  FocusZone,
  DetailsHeader,
  IDetailsHeaderProps,
  IGroup,
  IColumn,
  Image,
  Text,
  Stack,
  Selection,
  MarqueeSelection
} from "@fluentui/react";
import {
  DatasetTaskType,
  IVisionListItem,
  AccessibleDetailsList
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import React from "react";

import { getAltTextForItem } from "../utils/getAltTextUtils";
import { getFilteredDataFromSearch } from "../utils/getFilteredData";
import { getTableListColumns } from "../utils/getTableListColumns";
import { isItemPredTrueEqual } from "../utils/labelUtils";
import { visionExplanationDashboardStyles } from "../VisionExplanationDashboard.styles";

import {
  defaultState,
  ITableListProps,
  ITableListState
} from "./TableListHelper";

export class TableList extends React.Component<
  ITableListProps,
  ITableListState
> {
  private _selection: Selection;
  public constructor(props: ITableListProps) {
    super(props);
    this._selection = new Selection({
      onSelectionChanged: (): void => this.updateSelection()
    });
    this.state = defaultState;
  }

  public componentDidUpdate(prevProps: ITableListProps): void {
    if (
      this.props.errorInstances !== prevProps.errorInstances ||
      this.props.successInstances !== prevProps.successInstances ||
      this.props.searchValue !== prevProps.searchValue
    ) {
      const filteredItems: IVisionListItem[] = this.getFilteredItems();
      const searchVal = this.props.searchValue.toLocaleLowerCase();
      const groups: IGroup[] =
        searchVal.length === 0
          ? this.getGroups()
          : this.getFilteredGroups(filteredItems, this.state.groups);
      this.setState({
        filteredGroups: groups,
        filteredItems
      });
    }
  }

  public componentDidMount(): void {
    const filteredItems: IVisionListItem[] = this.getFilteredItems();
    const groups: IGroup[] = this.getGroups();
    const filteredGroups: IGroup[] = this.getFilteredGroups(
      filteredItems,
      groups
    );
    const columns = getTableListColumns(
      this.props.taskType,
      this.props.otherMetadataFieldNames
    );
    this.setState({
      columns,
      filteredGroups,
      filteredItems,
      groups
    });
  }

  public render(): React.ReactNode {
    const classNames = visionExplanationDashboardStyles();
    return (
      <FocusZone className={classNames.tableListContainer}>
        <Stack id="tabsViewTableList">
          <Stack.Item>
            <MarqueeSelection selection={this._selection}>
              <AccessibleDetailsList
                key={this.props.searchValue}
                items={this.state.filteredItems}
                groups={this.state.filteredGroups}
                columns={this.state.columns}
                groupProps={{ showEmptyGroups: true }}
                onRenderDetailsHeader={this.onRenderDetailsHeader}
                onRenderItemColumn={this.onRenderColumn}
                selection={this._selection}
                setKey="set"
                onItemInvoked={this.props.selectItem}
                ariaLabel={
                  localization.InterpretVision.Dashboard.tabOptionSecond
                }
              />
            </MarqueeSelection>
          </Stack.Item>
        </Stack>
      </FocusZone>
    );
  }

  private getFilteredItems(): IVisionListItem[] {
    let items: IVisionListItem[] = [];

    items = items.concat(this.props.successInstances);
    items = items.concat(this.props.errorInstances);
    const searchValue = this.props.searchValue.toLocaleLowerCase();
    if (searchValue.length === 0) {
      return items;
    }
    const filteredItems = getFilteredDataFromSearch(
      searchValue,
      items,
      this.props.taskType,
      this.props.onSearchUpdated
    );
    return filteredItems;
  }

  private getGroups(): IGroup[] {
    const groups: IGroup[] = [
      {
        count: this.props.successInstances.length,
        key: "success",
        level: 0,
        name: localization.InterpretVision.Dashboard.titleBarSuccess,
        startIndex: 0
      },
      {
        count: this.props.errorInstances.length,
        key: "error",
        level: 0,
        name: localization.InterpretVision.Dashboard.titleBarError,
        startIndex: this.props.successInstances.length
      }
    ];
    return groups;
  }

  private getFilteredGroups(
    filteredItems: IVisionListItem[],
    groups: IGroup[]
  ): IGroup[] {
    const searchValue = this.props.searchValue.toLocaleLowerCase();
    if (searchValue.length === 0) {
      return groups;
    }
    const filteredSuccessInstances = filteredItems.filter((item) =>
      isItemPredTrueEqual(item, this.props.taskType)
    );
    groups[0].count = filteredSuccessInstances.length;
    groups[1].startIndex = filteredSuccessInstances.length;
    groups[1].count = filteredItems.length - filteredSuccessInstances.length;

    return groups;
  }

  private onRenderDetailsHeader = (
    props: IDetailsHeaderProps | undefined
  ): React.ReactElement => {
    if (!props) {
      return <div />;
    }
    return (
      <DetailsHeader
        {...props}
        ariaLabelForToggleAllGroupsButton={"Expand collapse groups"}
      />
    );
  };

  private onRenderColumn = (
    item: IVisionListItem | undefined,
    _index: number | undefined,
    column?: IColumn | undefined
  ): React.ReactNode => {
    const classNames = visionExplanationDashboardStyles();
    let value =
      item && column && column.fieldName
        ? item[column.fieldName as keyof IVisionListItem]
        : "";
    // Handle multilabel case for trueY and predictedY
    if (value && Array.isArray(value)) {
      value = value.join(", ");
    } else if (this.props.taskType === DatasetTaskType.ObjectDetection) {
      if (item && column && column.fieldName === "correctDetections") {
        value = item["odCorrect" as keyof IVisionListItem];
      } else if (item && column && column.fieldName === "incorrectDetections") {
        value = item["odIncorrect" as keyof IVisionListItem];
      }
    }
    const image =
      item && column && column.fieldName === "image"
        ? item["image" as keyof IVisionListItem]
        : "";
    return (
      <Stack horizontal tokens={{ childrenGap: "s1" }}>
        {image && item ? (
          <Stack.Item>
            <Image
              alt={getAltTextForItem(item, this.props.taskType)}
              className={classNames.tableListImage}
              src={`data:image/jpg;base64,${image}`}
              style={{ width: this.props.imageDim }}
            />
          </Stack.Item>
        ) : (
          <Stack.Item>
            <Text>{value}</Text>
          </Stack.Item>
        )}
      </Stack>
    );
  };

  private updateSelection = (): void => {
    const selection = this._selection.getSelection() as IVisionListItem[];
    const indices: number[] = [];
    selection.forEach((item: IVisionListItem) => {
      indices.push(item.index);
    });
    this.props.updateSelectedIndices(indices);
  };
}

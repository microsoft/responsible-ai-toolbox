// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  FocusZone,
  DetailsList,
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
import { IVisionListItem } from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import React from "react";

import { ISearchable } from "../Interfaces/ISearchable";
import { getFilteredDataFromSearch } from "../utils/getFilteredData";
import { visionExplanationDashboardStyles } from "../VisionExplanationDashboard.styles";

export interface ITableListProps extends ISearchable {
  addCohort: (name: string, switchCohort: boolean) => void;
  errorInstances: IVisionListItem[];
  successInstances: IVisionListItem[];
  imageDim: number;
  otherMetadataFieldNames: string[];
  pageSize: number;
  selectItem: (item: IVisionListItem) => void;
  updateSelectedIndices: (indices: number[]) => void;
}

export interface ITableListState {
  filteredGroups: IGroup[];
  filteredItems: IVisionListItem[];
  groups: IGroup[];
  columns: IColumn[];
}

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
    this.state = {
      columns: [],
      filteredGroups: [],
      filteredItems: [],
      groups: []
    };
  }

  public componentDidUpdate(prevProps: ITableListProps): void {
    if (
      this.props.errorInstances !== prevProps.errorInstances ||
      this.props.successInstances !== prevProps.successInstances ||
      this.props.searchValue !== prevProps.searchValue
    ) {
      const filteredItems: IVisionListItem[] = this.getFilteredItems();
      const searchVal = this.props.searchValue.toLowerCase();
      if (searchVal.length === 0) {
        const groups: IGroup[] = this.getGroups();

        this.setState({
          filteredGroups: groups,
          filteredItems
        });
      } else {
        const filteredGroups: IGroup[] = this.getFilteredGroups(
          filteredItems,
          this.state.groups
        );
        this.setState({
          filteredGroups,
          filteredItems
        });
      }
    }
  }

  public componentDidMount(): void {
    const filteredItems: IVisionListItem[] = this.getFilteredItems();
    const groups: IGroup[] = this.getGroups();
    const filteredGroups: IGroup[] = this.getFilteredGroups(
      filteredItems,
      groups
    );

    const columns: IColumn[] = [
      {
        fieldName: "image",
        isResizable: true,
        key: "image",
        maxWidth: 400,
        minWidth: 200,
        name: localization.InterpretVision.Dashboard.columnOne
      },
      {
        fieldName: "index",
        isResizable: true,
        key: "index",
        maxWidth: 400,
        minWidth: 200,
        name: localization.InterpretVision.Dashboard.columnTwo
      },
      {
        fieldName: "trueY",
        isResizable: true,
        key: "truey",
        maxWidth: 400,
        minWidth: 200,
        name: localization.InterpretVision.Dashboard.columnThree
      },
      {
        fieldName: "predictedY",
        isResizable: true,
        key: "predictedy",
        maxWidth: 400,
        minWidth: 200,
        name: localization.InterpretVision.Dashboard.columnFour
      }
    ];
    const fieldNames = this.props.otherMetadataFieldNames;
    fieldNames.forEach((fieldName) => {
      columns.push({
        fieldName,
        isResizable: true,
        key: fieldName,
        maxWidth: 400,
        minWidth: 200,
        name: fieldName
      });
    });
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
        <Stack>
          <Stack.Item>
            <MarqueeSelection selection={this._selection}>
              <DetailsList
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
    const searchValue = this.props.searchValue.toLowerCase();
    if (searchValue.length === 0) {
      return items;
    }
    const filteredItems = getFilteredDataFromSearch(searchValue, items);
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
    const searchValue = this.props.searchValue.toLowerCase();
    if (searchValue.length === 0) {
      return groups;
    }
    const filteredSuccessInstances = filteredItems.filter(
      (item) => item.predictedY === item.trueY
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
    }

    const image =
      item && column && column.fieldName === "image"
        ? item["image" as keyof IVisionListItem]
        : "";

    return (
      <Stack horizontal tokens={{ childrenGap: "s1" }}>
        {image ? (
          <Stack.Item>
            <Image
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

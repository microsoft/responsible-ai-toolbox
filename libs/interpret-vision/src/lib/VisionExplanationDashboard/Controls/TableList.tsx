// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  FocusZone,
  DetailsList,
  DetailsHeader,
  IDetailsHeaderProps,
  IRenderFunction,
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

import { visionExplanationDashboardStyles } from "../VisionExplanationDashboard.styles";

export interface ITableListProps {
  addCohort: (name: string, switchCohort: boolean) => void;
  errorInstances: IVisionListItem[];
  successInstances: IVisionListItem[];
  imageDim: number;
  otherMetadataFieldName: string;
  pageSize: number;
  searchValue: string;
  selectItem: (item: IVisionListItem) => void;
  updateSelectedIndices: (indices: number[]) => void;
}

export interface ITableListState {
  items: IVisionListItem[];
  filter: string;
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
      onSelectionChanged: () => this.updateSelection()
    });
    this.state = {
      columns: [],
      filter: this.props.searchValue.toLowerCase(),
      filteredGroups: [],
      filteredItems: [],
      groups: [],
      items: []
    };
  }

  static getDerivedStateFromProps(
    props: ITableListProps,
    state: ITableListState
  ) {
    const searchVal = props.searchValue.toLowerCase();
    if (searchVal.length === 0) {
      let items: IVisionListItem[] = [];

      items = items.concat(props.successInstances);
      items = items.concat(props.errorInstances);

      const groups: IGroup[] = [
        {
          count: props.successInstances.length,
          key: "success",
          level: 0,
          name: localization.InterpretVision.Dashboard.titleBarSuccess,
          startIndex: 0
        },
        {
          count: props.errorInstances.length,
          key: "error",
          level: 0,
          name: localization.InterpretVision.Dashboard.titleBarError,
          startIndex: props.successInstances.length
        }
      ];

      return {
        filter: searchVal,
        filteredGroups: groups,
        filteredItems: items
      };
    }
    if (searchVal !== state.filter) {
      const groups = state.groups;
      const filteredItems = state.items.filter(
        (item) =>
          item.predictedY.toLowerCase().includes(searchVal) ||
          item.trueY.toLowerCase().includes(searchVal)
      );
      const filteredSuccessInstances = filteredItems.filter(
        (item) => item.predictedY === item.trueY
      );

      groups[0].count = filteredSuccessInstances.length;
      groups[1].startIndex = filteredSuccessInstances.length;
      groups[1].count = filteredItems.length - filteredSuccessInstances.length;

      return {
        filter: searchVal,
        filteredGroups: groups,
        filteredItems
      };
    }
    return undefined;
  }

  public componentDidMount(): void {
    let items: IVisionListItem[] = [];

    items = items.concat(this.props.successInstances);
    items = items.concat(this.props.errorInstances);

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
      },
      {
        fieldName: this.props.otherMetadataFieldName,
        isResizable: true,
        key: "other",
        maxWidth: 400,
        minWidth: 200,
        name: this.props.otherMetadataFieldName
      }
    ];
    this.setState({
      columns,
      filteredGroups: groups,
      filteredItems: items,
      groups,
      items
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

  private onRenderDetailsHeader = (
    props: IDetailsHeaderProps | undefined,
    _defaultRender?: IRenderFunction<IDetailsHeaderProps> | undefined
  ) => {
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
  ) => {
    const classNames = visionExplanationDashboardStyles();

    const value =
      item && column && column.fieldName
        ? item[column.fieldName as keyof IVisionListItem]
        : "";

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

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
} from "@fluentui/react";
import { localization } from "@responsible-ai/localization";
import React from "react";


export interface ITableListProps {
  imageDim: number;
  pageSize: number;
  openPanel(): void | undefined;
}

export interface ITableListState {
  items: IListItem[],
  groups: IGroup[],
  columns: IColumn[],
}

export interface IListItem {
  title: string;
  subtitle: string;
  image: string;
  trueY: number;
  predictedY: number;
  index: number;
  other: number;
}

export class TableList extends React.Component< ITableListProps, ITableListState > {  
 
  public constructor(props: ITableListProps) {
    super(props);
    
    this.state = {
      columns: [],
      groups: [],
      items: [],
    }
  }

  public componentDidMount(): void {
    const items: IListItem[] = []

    for (let i = 0; i < 50; i++) {
      items.push({  
                   image: 'https://1.bp.blogspot.com/-uhSQ0kz07ZI/UjCVa4_ru9I/AAAAAAAAYZI/g7RsfGH81LA/s1600/Duckling+Wallpapers+%25286%2529.jpg',
                   index: i + 1,
                   other: 0,
                   predictedY: 1,
                   subtitle: 'subtitle',
                   title: `label ${  (i + 1).toString()}`,
                   trueY: 0,
                 })
    }

    const groups: IGroup[] = [
      {count: this.props.pageSize, key: 'success', level: 0, name: localization.Interpret.VisionDatasetExplorer.titleBarSuccess, startIndex: 0},
      {count: this.props.pageSize, key: 'error', level: 0, name: localization.Interpret.VisionDatasetExplorer.titleBarError, startIndex: this.props.pageSize}
    ]

    const columns: IColumn[] = [
      {fieldName: "title", isResizable: true, key: "title", maxWidth: 400, minWidth: 200, name: localization.Interpret.VisionDatasetExplorer.columnOne},
      {fieldName: "index", isResizable: true, key: "index", maxWidth: 400, minWidth: 200, name: localization.Interpret.VisionDatasetExplorer.columnTwo},
      {fieldName: "trueY", isResizable: true, key: "truey", maxWidth: 400, minWidth: 200, name: localization.Interpret.VisionDatasetExplorer.columnThree},
      {fieldName: "predictedY", isResizable: true, key: "predictedy", maxWidth: 400, minWidth: 200, name: localization.Interpret.VisionDatasetExplorer.columnFour},
      {fieldName: "other", isResizable: true, key: "other", maxWidth: 400, minWidth: 200, name: localization.Interpret.VisionDatasetExplorer.columnFive},
    ]
    

    this.setState({ columns, groups, items })

  }

  public render(): React.ReactNode {
    //const classNames = tableListStyles();

    return (
      <FocusZone style={{width: '100%'}}>
        <DetailsList 
          items={this.state.items}
          groups={this.state.groups}
          columns={this.state.columns}
          groupProps={{showEmptyGroups: true}}
          onRenderDetailsHeader={this.onRenderDetailsHeader}
          onRenderItemColumn={this.onRenderColumn}
        />
      </FocusZone>

    );
  }

  private onRenderDetailsHeader = (props: IDetailsHeaderProps | undefined, _defaultRender?: IRenderFunction<IDetailsHeaderProps> | undefined) => {
    if (!props) {
      return <div />
    }
    return <DetailsHeader {...props} ariaLabelForToggleAllGroupsButton={'Expand collapse groups'} />;
  }


  private onRenderColumn = (item: IListItem | undefined, index: number | undefined, column?: IColumn | undefined) => {

    const value = item && column && column.fieldName ? item[column.fieldName as keyof IListItem] : '';

    const image = item && column && column.fieldName === "title" ? item["image" as keyof IListItem] : '';

    if (typeof (image) === "number") {
      return <div />;
    }

    if (index) {
      index = index + 1;
    }

    const subtitle = item && column && column.fieldName === "title" ? item["subtitle" as keyof IListItem] : '';

    return <div data-is-focusable>
      <Stack horizontal tokens={{ childrenGap: "s1" }}>
        {image && <Stack.Item>
          <Image src={image} style={{ borderRadius: 4, height: 'auto', width: this.props.imageDim }} />
        </Stack.Item>}
        <Stack.Item>
          <Stack>
            <Stack.Item><Text>{value}</Text></Stack.Item>
            {subtitle && <Stack.Item><Text>{subtitle}</Text></Stack.Item>}
          </Stack>
        </Stack.Item>
      </Stack>
    </div>;
  };

}

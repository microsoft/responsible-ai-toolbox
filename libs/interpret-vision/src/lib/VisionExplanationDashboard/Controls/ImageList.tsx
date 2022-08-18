// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  Text,
  FocusZone,
  List,
  Image,
  IRectangle,
  Stack
} from "@fluentui/react";
import { IVisionListItem } from "@responsible-ai/core-ui";
import React from "react";

import { imageListStyles } from "./ImageList.styles";

export interface IImageListProps {
  data: IVisionListItem[];
  imageDim: number;
  selectItem: (item: IVisionListItem) => void;
}

export interface IImageListState {
  data: IVisionListItem[];
}

const RowsPerPage = 3;
const ImagePadding = 10;

export class ImageList extends React.Component<
  IImageListProps,
  IImageListState
> {
  columnCount: number;
  rowHeight: number;
  public constructor(props: IImageListProps) {
    super(props);
    this.columnCount = 0;
    this.rowHeight = 0;
    this.state = {
      data: []
    };
  }

  public componentDidMount() {
    const data = this.props.data;
    this.setState({ data });
  }

  public render(): React.ReactNode {
    const classNames = imageListStyles();

    return (
      <FocusZone>
        <List
          key={this.props.imageDim}
          items={this.state.data}
          onRenderCell={this.onRenderCell}
          className={classNames.list}
          getPageHeight={this.getPageHeight}
          getItemCountForPage={this.getItemCountForPage}
        />
      </FocusZone>
    );
  }

  private onRenderCell = (item?: IVisionListItem | undefined) => {
    const classNames = imageListStyles();

    return (
      <Stack
        tokens={{ childrenGap: "s1" }}
        className={classNames.tile}
        style={{ width: `${100 / this.columnCount}%` }}
      >
        <Stack.Item className={classNames.imageSizer}>
          <Stack.Item
            className={classNames.imageFrame}
            style={{ height: this.props.imageDim, width: this.props.imageDim }}
          >
            <Image
              alt={item?.predictedY}
              src={`data:image/jpg;base64,${item?.image}`}
              onClick={this.callbackWrapper(item)}
              style={{
                height: "auto",
                width: this.props.imageDim
              }}
            />
          </Stack.Item>
          <Stack.Item>
            <Text
              className={classNames.label}
              style={{ width: this.props.imageDim - 3 }}
            >
              {item?.predictedY}
            </Text>
          </Stack.Item>
        </Stack.Item>
      </Stack>
    );
  };

  private callbackWrapper = (item?: IVisionListItem | undefined) => () => {
    if (!item) {
      return;
    }
    this.props.selectItem(item);
  };

  private getPageHeight = () => {
    return this.rowHeight * RowsPerPage;
  };

  private getItemCountForPage = (
    itemIndex?: number | undefined,
    visibleRect?: IRectangle | undefined
  ): number => {
    if (!visibleRect) {
      return this.columnCount * RowsPerPage;
    }
    if (itemIndex === 0) {
      this.columnCount = Math.ceil(
        visibleRect.width / (this.props.imageDim + 2 * ImagePadding)
      );
      this.rowHeight = Math.floor(visibleRect.width / this.columnCount);
    }
    return this.columnCount * RowsPerPage;
  };
}

// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  Text,
  FocusZone,
  List,
  Image,
  IImageProps,
  ImageFit,
  IRectangle,
  Stack
} from "@fluentui/react";
import { IVisionListItem } from "@responsible-ai/core-ui";
import React from "react";

import { imageListStyles } from "./ImageList.styles";

export interface IImageListProps {
  data: IVisionListItem[];
  imageDim: number;
  searchValue: string;
  selectItem: (item: IVisionListItem) => void;
}

export interface IImageListState {
  data: IVisionListItem[];
  filter: string;
  filteredItems: IVisionListItem[];
}

const RowsPerPage = 3;
const ImagePadding = 2;
const imageProps: IImageProps = {
  imageFit: ImageFit.cover
};

export class ImageList extends React.Component<
  IImageListProps,
  IImageListState
> {
  columnCount: number;
  rowHeight: number;
  paddingPercentage: number;
  public constructor(props: IImageListProps) {
    super(props);
    this.columnCount = 0;
    this.rowHeight = 0;
    this.paddingPercentage = 0;
    this.state = {
      data: [],
      filter: this.props.searchValue.toLowerCase(),
      filteredItems: []
    };
  }

  static getDerivedStateFromProps(
    props: IImageListProps,
    state: IImageListState
  ) {
    const searchVal = props.searchValue.toLowerCase();
    if (searchVal.length === 0) {
      return {
        filter: searchVal,
        filteredItems: state.data
      };
    }
    if (searchVal !== state.filter) {
      return {
        filter: searchVal,
        filteredItems: state.data.filter(
          (item) =>
            item.predictedY.toLowerCase().includes(searchVal) ||
            item.trueY.toLowerCase().includes(searchVal)
        )
      };
    }
    return undefined;
  }

  public componentDidMount() {
    const data = this.props.data;
    this.setState({ data, filteredItems: data });
  }

  public render(): React.ReactNode {
    const classNames = imageListStyles();

    return (
      <FocusZone>
        <List
          key={this.props.imageDim}
          items={this.state.filteredItems}
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
        style={{
          width: `${100 / this.columnCount}%`
        }}
      >
        <Stack.Item className={classNames.imageSizer}>
          <Stack.Item
            className={classNames.imageFrame}
            style={{
              height: this.props.imageDim - ImagePadding,
              overflow: "hidden",
              width: this.props.imageDim - ImagePadding
            }}
          >
            <Image
              {...imageProps}
              alt={item?.predictedY}
              src={`data:image/jpg;base64,${item?.image}`}
              onClick={this.callbackWrapper(item)}
              width={this.props.imageDim}
              className={classNames.image}
            />
          </Stack.Item>
          <Stack.Item
            className={classNames.labelContainer}
            style={{
              left: ImagePadding,
              top: ImagePadding,
              width: "100%"
            }}
          >
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
      this.columnCount = Math.ceil(visibleRect.width / this.props.imageDim);
      this.rowHeight = Math.floor(visibleRect.width / this.columnCount);
    }
    return this.columnCount * RowsPerPage;
  };
}

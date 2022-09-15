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
const ImagePadding = 15;
const imageProps: IImageProps = {
  imageFit: ImageFit.cover
};
const stackTokens = {
  childrenGap: "s1"
};

export class ImageList extends React.Component<
  IImageListProps,
  IImageListState
> {
  private columnCount: number;
  private rowHeight: number;
  public constructor(props: IImageListProps) {
    super(props);
    this.columnCount = 0;
    this.rowHeight = 0;
    this.state = {
      data: [],
      filter: this.props.searchValue.toLowerCase(),
      filteredItems: []
    };
  }

  public static getDerivedStateFromProps(
    props: IImageListProps,
    state: IImageListState
  ): Partial<IImageListState> {
    if (props.data !== state.data && props.data.length > 0) {
      return {
        filter: "",
        filteredItems: props.data
      };
    }

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
    return state;
  }

  public componentDidMount(): void {
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

  private onRenderCell = (
    item?: IVisionListItem | undefined
  ): React.ReactNode => {
    const classNames = imageListStyles();
    if (!item) {
      return;
    }

    return (
      <Stack
        tokens={stackTokens}
        className={classNames.tile}
        style={{
          height: this.props.imageDim * 1.1,
          width: `${100 / this.columnCount}%`
        }}
      >
        <Stack.Item
          className={classNames.imageSizer}
          style={{ paddingBottom: this.props.imageDim / 1.4 }}
        >
          <Stack.Item
            className={classNames.imageFrame}
            style={{
              height: this.props.imageDim,
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
            className={
              item?.predictedY === item?.trueY
                ? classNames.successIndicator
                : classNames.errorIndicator
            }
            style={{
              left: ImagePadding,
              maxWidth: this.props.imageDim
            }}
          >
            <Text className={classNames.labelPredicted}>
              {item?.predictedY}
            </Text>
          </Stack.Item>
          <Stack.Item
            className={classNames.labelContainer}
            style={{
              left: ImagePadding - 14,
              width:
                this.props.imageDim > 200
                  ? this.props.imageDim
                  : this.props.imageDim - 1.35 * ImagePadding
            }}
          >
            <Text
              className={classNames.label}
              style={{ width: this.props.imageDim - 20 }}
            >
              {item?.trueY}
            </Text>
          </Stack.Item>
        </Stack.Item>
      </Stack>
    );
  };

  private callbackWrapper =
    (item?: IVisionListItem | undefined) => (): void => {
      if (!item) {
        return;
      }
      this.props.selectItem(item);
    };

  private getPageHeight = (): number => {
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

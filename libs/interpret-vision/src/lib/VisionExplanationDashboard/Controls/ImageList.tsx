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
  selectedItems: boolean[];
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
      filteredItems: [],
      selectedItems: []
    };
  }

  static getDerivedStateFromProps(
    props: IImageListProps,
    state: IImageListState
  ) {
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
    return undefined;
  }

  public componentDidMount() {
    const data = this.props.data;
    const selectedItems: boolean[] = [];
    for (let i = 0; i < data.length; i++) {
      selectedItems.push(false);
    }
    this.setState({ data, filteredItems: data, selectedItems });
  }

  public render(): React.ReactNode {
    const classNames = imageListStyles();
    const items = this.state.filteredItems;
    return (
      <FocusZone>
        <List
          key={this.props.imageDim}
          items={items}
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
    if (!item) {
      return;
    }

    return (
      <Stack
        tokens={stackTokens}
        className={classNames.tile}
        style={{
          height: this.props.imageDim * 1.05,
          width: `${100 / this.columnCount}%`
        }}
      >
        <Stack.Item
          className={classNames.imageSizer}
          style={{ paddingBottom: this.props.imageDim / 1.4 }}
        >
          <Stack.Item
            className={
              item.selected ? classNames.selectedImage : classNames.imageFrame
            }
            style={{
              height: this.props.imageDim * 1.05,
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

  private callbackWrapper = (item?: IVisionListItem | undefined) => () => {
    if (!item) {
      return;
    }
    const { selectedItems } = this.state;
    selectedItems[item.index] = !selectedItems[item.index];
    this.setState({ selectedItems: [...selectedItems] });

    let items = this.state.filteredItems;
    items = items.map((i) => {
      if (i.index === item.index) {
        i.selected = !i.selected;
      }
      return i;
    });

    this.setState({ filteredItems: [...items] });

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

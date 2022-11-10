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

import { ISearchable } from "../Interfaces/ISearchable";
import { getFilteredDataFromSearch } from "../utils/getFilteredData";

import { imageListStyles } from "./ImageList.styles";

export interface IImageListProps extends ISearchable {
  items: IVisionListItem[];
  imageDim: number;
  selectItem: (item: IVisionListItem) => void;
}

export interface IImageListState {
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

    const filteredItems: IVisionListItem[] = this.getFilteredItems();
    this.state = {
      filteredItems
    };
  }

  public componentDidUpdate(prevProps: IImageListProps): void {
    if (
      this.props.items !== prevProps.items ||
      this.props.searchValue !== prevProps.searchValue
    ) {
      const filteredItems: IVisionListItem[] = this.getFilteredItems();
      this.setState({ filteredItems });
    }
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

  private getFilteredItems(): IVisionListItem[] {
    const searchValue = this.props.searchValue.toLowerCase();
    let filteredItems: IVisionListItem[] = this.props.items;
    if (searchValue.length > 0) {
      filteredItems = getFilteredDataFromSearch(searchValue, filteredItems);
    }
    return filteredItems;
  }

  private onRenderCell = (
    item?: IVisionListItem | undefined
  ): React.ReactNode => {
    const classNames = imageListStyles();
    if (!item) {
      return;
    }
    const predictedY = item?.predictedY;
    const alt = Array.isArray(predictedY) ? predictedY.join(",") : predictedY;

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
              alt={alt}
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

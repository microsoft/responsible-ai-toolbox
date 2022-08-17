// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  Text,
  FocusZone,
  List,
  Image,
  IRectangle,
  IPageSpecification
} from "@fluentui/react";
import { IVisionListItem } from "@responsible-ai/core-ui";
import React from "react";

import { imageListStyles } from "./ImageList.styles";

export interface IImageListProps {
  data: IVisionListItem[];
  imageDim: number;
  selectItem: (item: IVisionListItem) => void;
}

export class IImageListState {}

export class ImageList extends React.Component<
  IImageListProps,
  IImageListState
> {
  public constructor(props: IImageListProps) {
    super(props);

    this.state = {};
  }

  public render(): React.ReactNode {
    const classNames = imageListStyles();

    return (
      <FocusZone>
        <List
          items={this.props.data}
          onRenderCell={this.onRenderCell}
          className={classNames.list}
          getPageSpecification={this.getPageSpecification}
        />
      </FocusZone>
    );
  }

  private onRenderCell = (item?: IVisionListItem | undefined) => {
    const classNames = imageListStyles();
    return (
      <div
        data-is-focusable
        className={classNames.tile}
        onClick={this.callbackWrapper(item)}
        onKeyPress={this.callbackWrapper(item)}
        role="button"
        tabIndex={0}
      >
        <Text className={classNames.label}>{item?.predictedY}</Text>
        <Image
          alt={item?.predictedY}
          src={`data:image/jpg;base64,${item?.image}`}
          style={{ height: "auto", width: this.props.imageDim }}
        />
      </div>
    );
  };

  private callbackWrapper = (item?: IVisionListItem | undefined) => () => {
    if (!item) {
      return;
    }
    this.props.selectItem(item);
  };

  private getPageSpecification = (
    itemIndex?: number | undefined,
    visibleRect?: IRectangle | undefined
  ) => {
    const ret: IPageSpecification = {};
    if (!visibleRect || !itemIndex) {
      return ret;
    }
    /* Height of each tile is calculated as rowsPerPage * (defaultImageDim + textPadder + textHeight) */
    ret.height = 750;

    /* Item count is calculated as rowsPerPage * (rectangle width / (imageDim + padder + padder)) */
    ret.itemCount = 3 * (visibleRect.width / (this.props.imageDim + 20 + 20));

    return ret;
  };
}

// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  Text,
  FocusZone,
  List,
  Image,
  ImageFit,
  IRectangle,
  IPageSpecification
} from "@fluentui/react";
import React from "react";

import { IDatasetSummary } from "../Interfaces/IExplanationDashboardProps";

import { imageListStyles } from "./ImageList.styles";

export interface IImageListProps {
  data: IDatasetSummary;
  imageDim: number;
  openPanel: () => void;
}

export interface IImageListState {
  images: IListItem[];
}

export interface IListItem {
  title: string;
  image: string;
}

export class ImageList extends React.Component<
  IImageListProps,
  IImageListState
> {
  public constructor(props: IImageListProps) {
    super(props);

    this.state = {
      images: []
    };
  }

  public componentDidMount() {
    if (!this.props.data.classNames) {
      return;
    }
    const label: string = this.props.data.classNames[0];
    const images: IListItem[] = [];
    this.props.data.images.forEach((item) => {
      images.push({
        image: item,
        title: label
      });
    });

    this.setState({ images });
  }

  public render(): React.ReactNode {
    const classNames = imageListStyles();

    return (
      <FocusZone>
        <List
          items={this.state.images}
          onRenderCell={this.onRenderCell}
          className={classNames.list}
          getPageSpecification={this.getPageSpecification}
        />
      </FocusZone>
    );
  }

  private onRenderCell = (item?: IListItem | undefined) => {
    const classNames = imageListStyles();
    return (
      <div
        data-is-focusable
        className={classNames.tile}
        onClick={this.props.openPanel}
        onKeyPress={this.props.openPanel}
        role="button"
        tabIndex={0}
      >
        <Text className={classNames.label}>{item?.title}</Text>
        <Image
          alt={item?.title}
          width={this.props.imageDim}
          height={this.props.imageDim}
          imageFit={ImageFit.contain}
          src={item?.image}
        />
      </div>
    );
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

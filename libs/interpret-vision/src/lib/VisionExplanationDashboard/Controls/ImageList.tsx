// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  Text,
  FocusZone,
  List,
  Image,
  ImageFit,
<<<<<<< HEAD
  IRectangle,
  IPageSpecification
} from "@fluentui/react";
import React from "react";

import { IDatasetSummary } from "../Interfaces/IExplanationDashboardProps";

import { imageListStyles } from "./ImageList.styles";

export interface IImageListProps {
  data: IDatasetSummary;
=======
  IRectangle
} from "@fluentui/react";
import React from "react";

import { imageListStyles } from "./ImageList.styles";

export interface IImageListProps {
>>>>>>> 46e04a056f03bc313b9772a6b29c79a92f937530
  imageDim: number;
  openPanel: () => void;
}

export interface IImageListState {
<<<<<<< HEAD
  images: IListItem[];
=======
  columnCount: number;
>>>>>>> 46e04a056f03bc313b9772a6b29c79a92f937530
}

export interface IListItem {
  title: string;
  image: string;
}

<<<<<<< HEAD
=======
const RowsPerPage = 3;

>>>>>>> 46e04a056f03bc313b9772a6b29c79a92f937530
export class ImageList extends React.Component<
  IImageListProps,
  IImageListState
> {
  public constructor(props: IImageListProps) {
    super(props);

    this.state = {
<<<<<<< HEAD
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
=======
      columnCount: 1
    };
  }

  public render(): React.ReactNode {
    const classNames = imageListStyles();

    const items: IListItem[] = [];

    for (let i = 0; i < 20; i++) {
      items.push({
        image:
          "https://1.bp.blogspot.com/-uhSQ0kz07ZI/UjCVa4_ru9I/AAAAAAAAYZI/g7RsfGH81LA/s1600/Duckling+Wallpapers+%25286%2529.jpg",
        title: `label ${(i + 1).toString()}`
      });
    }

    return (
      <FocusZone>
        <List
          items={items}
          onRenderCell={this.onRenderCell}
          className={classNames.list}
          getPageHeight={this.getPageHeight}
          getItemCountForPage={this.getItemCountForPage}
>>>>>>> 46e04a056f03bc313b9772a6b29c79a92f937530
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

<<<<<<< HEAD
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
=======
  private getPageHeight = () => {
    return this.props.imageDim * RowsPerPage;
  };

  private getItemCountForPage = (
    itemIndex?: number | undefined,
    surfaceRect?: IRectangle | undefined
  ) => {
    if (!surfaceRect || !itemIndex) {
      return 0;
    }

    if (itemIndex === 0) {
      this.setState({
        columnCount: Math.ceil(surfaceRect.width / this.props.imageDim)
      });
    }

    return this.state.columnCount * RowsPerPage;
>>>>>>> 46e04a056f03bc313b9772a6b29c79a92f937530
  };
}

// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  Text,
  FocusZone,
  List,
  Image,
  ImageFit,
  IRectangle,
} from "@fluentui/react";
import React from "react";

import { imageListStyles } from "./ImageList.styles";

export interface IImageListProps {
  imageDim: number;
  openPanel(): void | undefined;
}

export interface IImageListState {
  columnCount: number;
}

export interface IListItem {
  title: string;
  image: string;
}

const RowsPerPage = 3;


export class ImageList extends React.Component< IImageListProps, IImageListState > {  
 
  public constructor(props: IImageListProps) {
    super(props);
    
    this.state = {
      columnCount: 1,
    }
  }


  public render(): React.ReactNode {
    const classNames = imageListStyles();

    const items: IListItem[] = []

    for (let i = 0; i < 20; i++) {
      items.push({ image: 'https://1.bp.blogspot.com/-uhSQ0kz07ZI/UjCVa4_ru9I/AAAAAAAAYZI/g7RsfGH81LA/s1600/Duckling+Wallpapers+%25286%2529.jpg', title: `label ${(i + 1).toString()}`})
    }

    return (
      <FocusZone>
        <List 
          items={items} 
          onRenderCell={this.onRenderCell}
          className={classNames.list}
          getPageHeight={this.getPageHeight}
          getItemCountForPage={this.getItemCountForPage}
        />
      </FocusZone>

    );
  }

  private onRenderCell = (item?: IListItem | undefined ) => {

    const classNames = imageListStyles();
    return (
      <div data-is-focusable className={classNames.tile} onClick={this.props.openPanel} onKeyPress={this.props.openPanel} role="button" tabIndex={0}>
          <Text className={classNames.label}>{item?.title}</Text>
          <Image alt={item?.title} width={this.props.imageDim} height={this.props.imageDim} imageFit={ImageFit.contain} src={item?.image} />
      </div>
    )
  }

  private getPageHeight = () => {
    return this.props.imageDim * RowsPerPage;
  }

  private getItemCountForPage = (itemIndex?: number | undefined, surfaceRect?: IRectangle | undefined) => {
    if (!surfaceRect || !itemIndex) {
      return 0
    }

    if (itemIndex === 0) {
      this.setState({ columnCount: Math.ceil(surfaceRect.width / this.props.imageDim )})
    }

    return this.state.columnCount * RowsPerPage
  }
}

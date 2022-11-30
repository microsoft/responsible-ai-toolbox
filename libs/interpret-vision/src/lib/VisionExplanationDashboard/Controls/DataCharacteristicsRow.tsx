// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  Stack,
  List,
  IRectangle,
  IIconProps,
  IconButton,
  getTheme,
  mergeStyles
} from "@fluentui/react";
import { IVisionListItem } from "@responsible-ai/core-ui";
import React from "react";

import { dataCharacteristicsStyles } from "./DataCharacteristics.styles";
import { DataCharacteristicsHeader } from "./DataCharacteristicsHeader";

export interface IDataCharacteristicsRowProps {
  columnCount: number;
  index: number;
  imageDim: number;
  label: string;
  labelType: string;
  list: IVisionListItem[];
  renderStartIndex: number[];
  showBackArrow: boolean[];
  totalListLength: number;
  onRenderCell: (item?: IVisionListItem | undefined) => JSX.Element;
  loadPrevItems: (index: number) => () => void;
  loadNextItems: (index: number) => () => void;
  getPageHeight: () => number;
  getItemCountForPage: (
    itemIndex?: number | undefined,
    visibleRect?: IRectangle | undefined
  ) => number;
}

const theme = getTheme();
const iconStyle = {
  root: {
    color: theme.semanticColors.inputIconDisabled
  }
};
const rightArrow: IIconProps = {
  iconName: "DoubleChevronRight12",
  styles: iconStyle
};
const leftArrow: IIconProps = {
  iconName: "DoubleChevronLeft12",
  styles: iconStyle
};

export class DataCharacteristicsRow extends React.Component<IDataCharacteristicsRowProps> {
  public render(): React.ReactNode {
    const classNames = dataCharacteristicsStyles();
    const {
      columnCount,
      index,
      imageDim,
      label,
      list,
      renderStartIndex,
      showBackArrow,
      totalListLength,
      onRenderCell,
      loadPrevItems,
      loadNextItems,
      getPageHeight,
      getItemCountForPage
    } = this.props;
    const listContainerStyle = mergeStyles(classNames.listContainer, {
      height: imageDim + 30
    });
    return (
      <Stack>
        <Stack.Item>
          <DataCharacteristicsHeader
            label={label}
            labelListLength={list.length}
            totalListLength={totalListLength}
          />
        </Stack.Item>
        <Stack.Item>
          <Stack horizontal verticalAlign="center">
            {showBackArrow[index] && (
              <Stack.Item className={classNames.iconContainer}>
                <IconButton
                  iconProps={leftArrow}
                  onClick={loadPrevItems(index)}
                />
              </Stack.Item>
            )}
            <Stack.Item className={listContainerStyle}>
              <List
                key={this.props.list[0].predictedY}
                items={list}
                onRenderCell={onRenderCell}
                getPageHeight={getPageHeight}
                getItemCountForPage={getItemCountForPage}
                startIndex={renderStartIndex[index]}
              />
            </Stack.Item>
            {list.length - renderStartIndex[index] > columnCount && (
              <Stack.Item className={classNames.iconContainer}>
                <IconButton
                  iconProps={rightArrow}
                  onClick={loadNextItems(index)}
                />
              </Stack.Item>
            )}
          </Stack>
        </Stack.Item>
      </Stack>
    );
  }
}

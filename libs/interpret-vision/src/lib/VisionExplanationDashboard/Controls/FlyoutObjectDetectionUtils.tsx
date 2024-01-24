// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IComboBoxOption, getTheme, Stack, Text } from "@fluentui/react";
import { IDataset, IVisionListItem } from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import React from "react";
import { CanvasTools } from "vott-ct";
import { Editor } from "vott-ct/lib/js/CanvasTools/CanvasTools.Editor";
import { RegionData } from "vott-ct/lib/js/CanvasTools/Core/RegionData";

export interface IFlyoutProps {
  dataset: IDataset;
  explanations: Map<number, Map<number, string>>;
  isOpen: boolean;
  item: IVisionListItem | undefined;
  loadingExplanation: boolean[][];
  otherMetadataFieldNames: string[];
  callback: () => void;
  onChange: (item: IVisionListItem, index: number) => void;
}

export interface IFlyoutState {
  item: IVisionListItem | undefined;
  metadata: Array<Array<string | number | boolean>> | undefined;
  selectableObjectIndexes: IComboBoxOption[];
  odSelectedKey: string;
  editorCallback?: HTMLDivElement;
}

export const stackTokens = {
  large: { childrenGap: "l2" },
  medium: { childrenGap: "l1" }
};

const theme = getTheme();

export class ColorLegend extends React.Component {
  public render(): React.ReactNode {
    return (
      <Stack horizontal tokens={stackTokens.large}>
        <Stack horizontal tokens={stackTokens.medium}>
          <Text variant="medium">
            {localization.InterpretVision.Dashboard.trueY}
          </Text>
          <div
            style={{
              backgroundColor: theme.palette.green,
              height: 20,
              width: 20
            }}
          />
        </Stack>
        <Stack horizontal tokens={stackTokens.medium}>
          <Text variant="medium">
            {localization.InterpretVision.Dashboard.predictedY}
          </Text>
          <div
            style={{
              backgroundColor: theme.palette.magenta,
              height: 20,
              width: 20
            }}
          />
        </Stack>
      </Stack>
    );
  }
}

export const ExcessLabelLen =
  localization.InterpretVision.Dashboard.prefix.length;

export function loadImageFromBase64(
  base64String: string,
  editor: Editor,
  altText: string
): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", (e) => {
      editor.addContentSource(e.target as HTMLImageElement);
      editor.AS.setSelectionMode(2);
      resolve(image);
    });
    image.addEventListener("error", () => {
      reject(new Error("Failed to load image"));
    });
    image.src = `data:image/jpg;base64,${base64String}`;
    image.alt = altText;
  });
}

export function drawBox(
  editor: Editor,
  dataset: IDataset,
  scaleFactor: (
    coordinate: number,
    imageScale: number,
    frameScale: number
  ) => number,
  imageDim: [number, number],
  objectLabel: number[],
  annotation: string,
  colorCode: string,
  boxId: string
): void {
  if (!dataset.image_dimensions) {
    return;
  }

  const [frameWidth, frameHeight] = editor.getFrameSize;
  const [imageWidth, imageHeight] = imageDim;

  // Creating box region
  const predBox = RegionData.BuildRectRegionData(
    scaleFactor(objectLabel[1], imageWidth, frameWidth),
    scaleFactor(objectLabel[2], imageHeight, frameHeight),
    scaleFactor(objectLabel[3] - objectLabel[1], imageWidth, frameWidth),
    scaleFactor(objectLabel[4] - objectLabel[2], imageHeight, frameHeight)
  );

  // Initializing bounding box tag
  const predTag = new CanvasTools.Core.Tag(annotation, colorCode);
  const predTagDesc = new CanvasTools.Core.TagsDescriptor([predTag]);

  // Drawing bounding box with vott
  editor.RM.addRectRegion(boxId, predBox, predTagDesc);
}

// Scales the box coordinate for correct relative position in the CanvasTools frame
export const scaleCoordinate = (
  coordinate: number,
  imageDim: number,
  frameDim: number
): number => (coordinate / imageDim) * frameDim;

export function drawBoundingBoxes(
  item: IVisionListItem,
  editorCallback: HTMLDivElement,
  editor: Editor,
  dataset: IDataset
): void {
  // Stops if the div container for the canvastools editor doesn't exist
  if (!editorCallback) {
    return;
  }

  // Ensuring object detection labels are populated
  if (
    !dataset.object_detection_predicted_y ||
    !dataset.object_detection_true_y ||
    !dataset.class_names
  ) {
    return;
  }

  // Retrieving labels for the image in the Flyout
  const predictedY: number[][] =
    dataset.object_detection_predicted_y[item.index];
  const trueY: number[][] = dataset.object_detection_true_y[item.index];

  // Drawing bounding boxes for each ground truth object
  for (const [oidx, gtObject] of trueY.entries()) {
    if (!dataset.image_dimensions) {
      break;
    }
    const objectLabelIndex = gtObject[0] - 1;

    // Retrieving label for annotation above the box
    const annotation: string = dataset.class_names[objectLabelIndex];

    drawBox(
      editor,
      dataset,
      scaleCoordinate,
      dataset.image_dimensions[oidx],
      gtObject,
      annotation,
      theme.palette.green,
      oidx.toString()
    );
  }

  // Draws bounding boxes for each predicted object
  for (const [oidx, predObject] of predictedY.entries()) {
    if (!dataset.image_dimensions) {
      break;
    }
    const objectLabelIndex = predObject[0] - 1;

    // Retrieving label for annotation above the box
    const className: string = dataset.class_names[objectLabelIndex];
    const confidenceScore: string = (predObject[5] * 100).toFixed(2);
    const annotation = `${oidx}.${className}(${confidenceScore}%)`;

    drawBox(
      editor,
      dataset,
      scaleCoordinate,
      dataset.image_dimensions[oidx],
      predObject,
      annotation,
      theme.palette.magenta,
      oidx.toString()
    );
  }
}

// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IComboBoxOption, getTheme } from "@fluentui/react";
import { IDataset, IVisionListItem } from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
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
export const ExcessLabelLen =
  localization.InterpretVision.Dashboard.prefix.length;

export function loadImageFromBase64(
  base64String: string,
  editor: Editor
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
  });
}

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

    const [frameWidth, frameHeight] = editor.getFrameSize;
    const scaleCoordinate = (coordinate: number, imageDim: number, frameDim: number): number => coordinate / imageDim * frameDim;

    // Initialize color constants
    const Color = CanvasTools.Core.Colors.Color;
    const theme = getTheme();

    // Ensuring object detection labels are populated
    if (!dataset.object_detection_predicted_y
        || !dataset.object_detection_true_y
        || !dataset.class_names) {
      return;
    }

    // Retrieving labels for the image in the Flyout
    const predictedY : number[][] = dataset.object_detection_predicted_y[item.index];
    const trueY : number[][]  = dataset.object_detection_true_y[item.index];

    // TODO: CREATE 2 FUNCTIONS!

    // Draws bounding boxes for each predicted object
    for (const [oidx, predObject] of predictedY.entries()) {

      if (!dataset.imageDimensions) {
        break;
      }

      let [imageWidth, imageHeight] = dataset.imageDimensions[oidx];

      // Creating box region
      const predBox = RegionData.BuildRectRegionData(
        scaleCoordinate(predObject[1], imageWidth, frameWidth),
        scaleCoordinate(predObject[2], imageHeight, frameHeight),
        scaleCoordinate(predObject[3]-predObject[1], imageWidth, frameWidth),
        scaleCoordinate(predObject[4]-predObject[2], imageHeight, frameHeight)
      );

      // Retrieving label for annotation above the box
      const className = dataset.class_names[predObject[0]-1];
      const confidenceScore = (predObject[5] * 100).toFixed(2);

      // Initializing bounding box tag
      const predTag = new CanvasTools.Core.Tag(`${oidx  }.${className  }(${  confidenceScore  }%)`, // Object(95%)
                                               new Color(theme.palette.magenta)); // TODO: change color contrast!
      const predTagDesc = new CanvasTools.Core.TagsDescriptor([predTag]);

      // Drawing bounding box with vott
      editor.RM.addRectRegion(oidx.toString(), predBox, predTagDesc);
    }

    // Drawing bounding boxes for each ground truth object
    for (const [oidx, element] of trueY.entries()) {

      if (!dataset.imageDimensions) {
        break;
      }

      let [imageWidth, imageHeight] = dataset.imageDimensions[oidx];

      // Creating box region
      const gtObject = element as number[]
      const gtBox = RegionData.BuildRectRegionData(
        scaleCoordinate(gtObject[1], imageWidth, frameWidth),
        scaleCoordinate(gtObject[2], imageHeight, frameHeight),
        scaleCoordinate(gtObject[3]-gtObject[1], imageWidth, frameWidth),
        scaleCoordinate(gtObject[4]-gtObject[2], imageHeight, frameHeight)
      );

      // Retrieving label for annotation above the box
      const className = dataset.class_names[gtObject[0]-1]

      // Initializing bounding box tag
      const gtTag = new CanvasTools.Core.Tag(className, new Color(theme.palette.magentaDark)) // Object(95%)
      const gtTagDesc = new CanvasTools.Core.TagsDescriptor([gtTag]);

      // Drawing bounding box with vott
      editor.RM.addRectRegion(oidx.toString(), gtBox, gtTagDesc);
    }
  }

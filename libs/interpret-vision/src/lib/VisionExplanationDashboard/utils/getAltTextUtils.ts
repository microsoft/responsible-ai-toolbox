// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IVisionListItem, DatasetTaskType } from "@responsible-ai/core-ui";

import { getJoinedLabelString } from "./labelUtils";

export function getAltTextForItem(
  item: IVisionListItem,
  taskType: string,
  isExplanation?: boolean
): string {
  if (taskType === DatasetTaskType.ObjectDetection) {
    return getObjectDetectionImageAltText(
      item.odCorrect,
      item.odIncorrect,
      item.index,
      isExplanation
    );
  }
  return getImageAltText(
    item.predictedY,
    item.trueY,
    item.index,
    isExplanation
  );
}

export function getImageAltText(
  predictedY: string | string[],
  trueY: string | string[],
  index?: number,
  isExplanation?: boolean
): string {
  let predictedYString = "predicted label";
  if (Array.isArray(predictedY)) {
    predictedYString += `s ${getJoinedLabelString(predictedY)}`;
  } else {
    predictedYString += ` ${predictedY}`;
  }
  let trueYString = "ground truth label";
  if (Array.isArray(trueY)) {
    trueYString += `s ${getJoinedLabelString(trueY)}`;
  } else {
    trueYString += ` ${trueY}`;
  }
  let headerString = isExplanation ? "Explanation of image" : "Image";
  if (index !== undefined) {
    headerString += ` with index ${index}`;
  }
  return `${headerString} and ${predictedYString} and ${trueYString}.`;
}

export function getObjectDetectionImageAltText(
  odCorrect: string | string[],
  odIncorrect: string | string[],
  index?: number,
  isExplanation?: boolean
): string {
  let headerString = isExplanation ? "Explanation of image" : "Image";
  if (index !== undefined) {
    headerString += ` with index ${index}`;
  }
  let odCorrectString = "correct object detection label";
  let odIncorrectString = "incorrect object detection label";
  if (Array.isArray(odCorrect)) {
    odCorrectString += `s ${getJoinedLabelString(odCorrect)}`;
  } else {
    odCorrectString += ` ${odCorrect}`;
  }
  if (Array.isArray(odIncorrect)) {
    odIncorrectString += `s ${getJoinedLabelString(odIncorrect)}`;
  } else {
    odIncorrectString += ` ${odIncorrect}`;
  }

  return `${headerString} and ${odCorrectString} and ${odIncorrectString}.`;
}

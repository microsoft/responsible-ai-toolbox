// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IColumn } from "@fluentui/react";
import { DatasetTaskType } from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";

export function getTableListColumns(
  taskType: string,
  otherMetadataFieldNames: string[]
): IColumn[] {
  const columns: IColumn[] = [
    {
      fieldName: "image",
      isResizable: true,
      key: "image",
      maxWidth: 400,
      minWidth: 200,
      name: localization.InterpretVision.Dashboard.columnOne
    },
    {
      fieldName: "index",
      isResizable: true,
      key: "index",
      maxWidth: 400,
      minWidth: 200,
      name: localization.InterpretVision.Dashboard.columnTwo
    }
  ];
  const labelColumns: IColumn[] = [
    {
      fieldName: "trueY",
      isResizable: true,
      key: "truey",
      maxWidth: 400,
      minWidth: 200,
      name: localization.InterpretVision.Dashboard.columnThree
    },
    {
      fieldName: "predictedY",
      isResizable: true,
      key: "predictedy",
      maxWidth: 400,
      minWidth: 200,
      name: localization.InterpretVision.Dashboard.columnFour
    }
  ];
  const objectDetectionLabelColumns: IColumn[] = [
    {
      fieldName: "correctDetections",
      isResizable: true,
      key: "correctDetections",
      maxWidth: 400,
      minWidth: 200,
      name: localization.InterpretVision.Dashboard.columnThreeOD
    },
    {
      fieldName: "incorrectDetections",
      isResizable: true,
      key: "incorrectDetections",
      maxWidth: 400,
      minWidth: 200,
      name: localization.InterpretVision.Dashboard.columnFourOD
    }
  ];
  if (taskType === DatasetTaskType.ObjectDetection) {
    columns.push(...objectDetectionLabelColumns);
  } else {
    columns.push(...labelColumns);
  }
  const fieldNames = otherMetadataFieldNames;
  fieldNames.forEach((fieldName) => {
    columns.push({
      fieldName,
      isResizable: true,
      key: fieldName,
      maxWidth: 400,
      minWidth: 200,
      name: fieldName
    });
  });
  return columns;
}

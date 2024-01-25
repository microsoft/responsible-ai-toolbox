// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IComboBoxOption, Stack, Text, Separator } from "@fluentui/react";
import { IVisionListItem } from "@responsible-ai/core-ui";
import React from "react";

import { flyoutStyles } from "../Controls/Flyout.styles";

export function onRenderCell(
  item?: Array<string | number | boolean> | undefined
): React.ReactNode {
  if (!item) {
    return;
  }
  return (
    <Stack.Item>
      <Stack
        horizontal
        tokens={{ childrenGap: "l2" }}
        verticalAlign="center"
        className={flyoutStyles().cell}
      >
        {item.map((val) => (
          <Stack.Item key={val.toString()}>
            <Text variant="large">{val}</Text>
          </Stack.Item>
        ))}
      </Stack>
      <Separator className={flyoutStyles().separator} />
    </Stack.Item>
  );
}

export function generateSelectableObjectDetectionIndexes(
  prefix: string,
  item: IVisionListItem | undefined,
  classNames: string[] | undefined
): IComboBoxOption[] {
  const temp = item?.odPredictedY;
  const selectableObjectIndexes: IComboBoxOption[] = [];
  if (temp && classNames) {
    for (let i = 0; i < Object.values(temp).length; i++) {
      const className = classNames[temp[i][0] - 1];
      selectableObjectIndexes.push({
        key: prefix + String(i),
        text: String(i) + String(": ") + className
      });
    }
  }
  return selectableObjectIndexes;
}

export function updateMetadata(
  item: IVisionListItem,
  fieldNames: string[]
): Array<Array<string | number | boolean>> {
  const metadata: Array<Array<string | number | boolean>> = [];
  fieldNames.forEach((fieldName) => {
    const itemField = item[fieldName];
    const itemValue = Array.isArray(itemField)
      ? itemField.join(",")
      : itemField;
    if (item[fieldName]) {
      metadata.push([fieldName, itemValue]);
    }
  });
  return metadata;
}

// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IComboBoxOption } from "@fluentui/react";
import { IDataset, IVisionListItem } from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import { Editor } from "vott-ct/lib/js/CanvasTools/CanvasTools.Editor";

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

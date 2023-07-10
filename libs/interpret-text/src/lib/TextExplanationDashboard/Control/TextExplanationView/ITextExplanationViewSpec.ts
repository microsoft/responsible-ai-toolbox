// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IChoiceGroupOption, IStackTokens } from "@fluentui/react";
import { localization } from "@responsible-ai/localization";

import { QAExplanationType, RadioKeys } from "../../CommonUtils";

export interface ITextExplanationViewState {
  /*
   * Holds the state of the dashboard
   */
  maxK: number;
  topK: number;
  radio: string;
  // qaRadio?: string;
  importances: number[];
  singleTokenImportances: number[];
  selectedToken: number;
  tokenIndexes: number[];
  text: string[];
}

export const options: IChoiceGroupOption[] = [
  /*
   * Creates the choices for the radio button
   */
  { key: RadioKeys.All, text: localization.InterpretText.View.allButton },
  { key: RadioKeys.Pos, text: localization.InterpretText.View.posButton },
  { key: RadioKeys.Neg, text: localization.InterpretText.View.negButton }
];

export const qaOptions: IChoiceGroupOption[] = [
  /*
   * Creates the choices for the QA prediction radio button
   */
  {
    key: QAExplanationType.Start,
    text: localization.InterpretText.View.startingPosition
  },
  {
    key: QAExplanationType.End,
    text: localization.InterpretText.View.endingPosition
  }
];

export const componentStackTokens: IStackTokens = {
  childrenGap: "m",
  padding: "m"
};

export const MaxImportantWords = 15;

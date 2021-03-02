// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IFairnessData } from "@responsible-ai/core-ui";

export const binaryClassification: IFairnessData = {
  predictedY: [
    [1, 0, 0, 1, 1, 1, 1, 0],
    [1, 1, 1, 1, 1, 1, 1, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ],
  testData: [
    ["a", "1", "test1", 1],
    ["b", "2", "test2", 2],
    ["b", "2", "test3", 3],
    ["very long group name indeed", "3", "test4", 1],
    ["b", "2", "test5", 2],
    ["b", "2", "test6", 3],
    ["b", "2", "test7", 0],
    ["b", "2", "test8", 3]
  ],
  trueY: [1, 0, 1, 1, 0, 1, 0, 0]
};

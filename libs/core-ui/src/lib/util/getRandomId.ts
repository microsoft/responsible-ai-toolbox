// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { v4 } from "uuid";

export function getRandomId(): string {
  return `Id_${v4()}`;
}

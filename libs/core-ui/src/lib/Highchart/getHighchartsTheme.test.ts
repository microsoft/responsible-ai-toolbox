// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { createTheme } from "@fluentui/react";

import { getHighchartsTheme } from "./getHighchartsTheme";

describe("getHighchartsTheme", () => {
  it("converts a numeric subtitle font size to a string", () => {
    const options = getHighchartsTheme(
      {
        subtitle: {
          style: {
            fontSize: 12
          }
        }
      },
      createTheme()
    );

    expect(options.subtitle?.style?.fontSize).toBe("12");
  });
});

// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { getSpan } from "../../../util/getSpan";
import { checkSensitiveFeatureSelectionPage } from "./describeConfigurationSelection";

export function describeGetStartedPage(): void {
  describe("get started page", () => {
    it("should show get started page", () => {
      // TODO add checks for get started page
      getSpan("Get started").click();
      // validate that click got to sensitive feature selection page
      checkSensitiveFeatureSelectionPage();
    });
  });
}

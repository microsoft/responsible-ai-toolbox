// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { shallow } from "enzyme";
import React from "react";

import { App } from "./App";

describe("FairnessWizardV2", () => {
  it("should render successfully", () => {
    const tree = shallow(<App />);
    expect(tree).toMatchSnapshot();
  });
});

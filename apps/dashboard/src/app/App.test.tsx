import React from "react";
import { shallow } from "enzyme";

import { App } from "./App";

describe("FairnessWizard", () => {
  it("should render successfully", () => {
    const tree = shallow(<App />);
    expect(tree).toMatchSnapshot();
  });
});

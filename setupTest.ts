import { configure } from "enzyme";
import ReactSixteenAdapter from "enzyme-adapter-react-16";
import "jest-canvas-mock";
import { initializeIcons } from "office-ui-fabric-react";

// Icons must be loaded from Microsoft domain for compliance
initializeIcons(
  "https://static2.sharepointonline.com/files/fabric/assets/icons/"
);

jest.setTimeout(30000);

if (!window.URL.createObjectURL) {
  window.URL.createObjectURL = () => "";
}

beforeEach(() => {
  jest.restoreAllMocks();
  jest.resetAllMocks();
  const dateTimeNowSpy = jest.spyOn(Date, "now");
  dateTimeNowSpy.mockReturnValue(0);
});

configure({ adapter: new ReactSixteenAdapter() });

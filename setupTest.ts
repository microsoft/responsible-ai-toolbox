import { configure } from "enzyme";
import ReactSeventeenAdapter from "@wojtekmaj/enzyme-adapter-react-17";
import "jest-canvas-mock";
import { initializeIcons } from "@fluentui/react";

initializeIcons();

jest.setTimeout(30000);

// mock moment timezone
const moment = jest.requireActual("moment-timezone");
jest.doMock("moment", () => {
  // Use timezone other than PST and UTC to show independence
  moment.tz.setDefault("Australia/Sydney");
  return moment;
});

if (!window.URL.createObjectURL) {
  window.URL.createObjectURL = () => "";
}

beforeEach(() => {
  jest.restoreAllMocks();
  jest.resetAllMocks();
  const dateTimeNowSpy = jest.spyOn(Date, "now");
  dateTimeNowSpy.mockReturnValue(0);
});

configure({ adapter: new ReactSeventeenAdapter() });

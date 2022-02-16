// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IButtonProps, IconButton } from "@fluentui/react";
import {
  ConfirmationDialog,
  IConfirmationDialogProps
} from "@responsible-ai/core-ui";
import { shallow, ShallowWrapper } from "enzyme";
import React from "react";

import {
  DashboardSettingDeleteButton,
  IDashboardSettingDeleteButtonProps,
  IDashboardSettingDeleteButtonState
} from "./DashboardSettingDeleteButton";

describe("DashboardSettingDeleteButton", () => {
  let tree: ShallowWrapper<
    IDashboardSettingDeleteButtonProps,
    IDashboardSettingDeleteButtonState,
    DashboardSettingDeleteButton
  >;
  let removeTab: jest.Mock;
  const index = 9527;
  beforeEach(() => {
    removeTab = jest.fn();
    tree = shallow(
      <DashboardSettingDeleteButton
        index={index}
        name="dummy"
        removeTab={removeTab}
      />
    );
  });
  it("should render successfully", () => {
    expect(tree).toMatchSnapshot();
  });
  describe("delete button", () => {
    let deleteButton: ShallowWrapper<IButtonProps>;
    beforeEach(() => {
      deleteButton = tree.find(IconButton);
    });
    it("should show delete button", () => {
      expect(deleteButton.exists()).toBe(true);
    });
    describe("confirmation dialog", () => {
      let confirmationDialog: ShallowWrapper<IConfirmationDialogProps>;
      beforeEach(() => {
        deleteButton.simulate("click");
        confirmationDialog = tree.find(ConfirmationDialog);
      });
      it("should set showConfirmDialog state after click delete", () => {
        expect(tree.state("showConfirmDialog")).toBe(true);
      });
      it("should show showConfirmDialog after click delete", () => {
        expect(confirmationDialog.exists()).toBe(true);
      });
      it("should hide ConfirmationDialog", async () => {
        const onClose = confirmationDialog.prop("onClose");
        onClose();
        expect(tree.find(ConfirmationDialog).exists()).toBe(false);
      });
      describe("confirm the delete", () => {
        beforeEach(() => {
          const onConfirm = confirmationDialog.prop("onConfirm");
          onConfirm();
        });
        it("should remove tab", async () => {
          expect(removeTab).toBeCalledWith(index);
        });
        it("should hide confirm dialog", async () => {
          expect(tree.find(ConfirmationDialog).exists()).toBe(false);
        });
      });
    });
  });
});

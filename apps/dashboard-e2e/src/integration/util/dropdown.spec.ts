// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { selectDropdown } from "@responsible-ai/e2e";

describe("Dropdown helper", () => {
  const optionText = "Store = 8, Brand = tropicana";

  beforeEach(() => {
    cy.intercept("GET", "/dropdown-helper-test", {
      body: "<!DOCTYPE html><html><head></head><body></body></html>",
      headers: { "content-type": "text/html" }
    });
    cy.visit("/dropdown-helper-test");
    cy.window().then((window) => {
      const document = window.document;
      document.body.style.height = "2400px";
      document.body.innerHTML = `
        <button id="dropdownSelectionTest"
          style="position:absolute;top:500px;height:36px;width:300px">
          Choose a series
        </button>
        <div id="dropdownOptions" role="listbox"
          style="position:absolute;top:540px;display:none">
          <button role="option" style="height:36px;width:300px">
            <span>${optionText}</span>
          </button>
        </div>`;
      const dropdown = document.querySelector<HTMLElement>(
        "#dropdownSelectionTest"
      );
      const options = document.querySelector<HTMLElement>("#dropdownOptions");
      if (!dropdown || !options) {
        throw new Error("Dropdown fixture was not created");
      }
      dropdown.addEventListener("click", () => {
        options.style.display = "block";
      });
      options.addEventListener("click", () => {
        dropdown.textContent = optionText;
        options.style.display = "none";
      });
      window.addEventListener("scroll", () => {
        options.style.display = "none";
      });
    });
  });

  it("selects a dropdown option rather than matching unrelated span text", () => {
    cy.document().then((document) => {
      const unrelatedText = document.createElement("span");
      unrelatedText.textContent = optionText;
      document.body.prepend(unrelatedText);
    });
    selectDropdown("#dropdownSelectionTest", optionText);
    cy.get("#dropdownSelectionTest").should("contain.text", optionText);
    cy.get("#dropdownOptions").should("not.be.visible");
  });

  it("does not scroll and dismiss an already visible option", () => {
    selectDropdown("#dropdownSelectionTest", optionText);
    cy.get("#dropdownSelectionTest").should("contain.text", optionText);
    cy.get("#dropdownOptions").should("not.be.visible");
  });
});

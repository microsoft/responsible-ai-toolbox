// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { shallow } from "enzyme";
import React from "react";

import { IExplanationModelMetadata } from "../../Interfaces/IExplanationContext";
import { FilterMethods, IFilter } from "../../Interfaces/IFilter";
import { JointDataset } from "../../util/JointDataset";
import { ColumnCategories } from "../../util/JointDatasetUtils";

import { FilterList } from "./FilterList";

const featureIsCategorical = [
  false,
  false,
  false,
  true,
  false,
  false,
  false,
  false,
  false,
  false,
  false,
  false,
  false
];
const modelMetadata = {
  classNames: ["Class 0"],
  featureIsCategorical,
  featureNames: [],
  featureNamesAbridged: [],
  featureRanges: [],
  modelType: "binary"
} as IExplanationModelMetadata;
const jointDataset = new JointDataset({
  dataset: [],
  metadata: modelMetadata
});

describe("FilterList", () => {
  it("Should render", () => {
    const filters = [
      {
        arg: [12.09],
        column: "alcohol",
        method: FilterMethods.LessThan
      },
      {
        arg: [2.5],
        column: "ash",
        method: FilterMethods.GreaterThan
      }
    ];

    jointDataset.metaDict.alcohol = {
      abbridgedLabel: "l",
      category: ColumnCategories.Dataset,
      isCategorical: true,
      label: "less than",
      treatAsCategorical: true
    };
    jointDataset.metaDict.ash = {
      abbridgedLabel: "g",
      category: ColumnCategories.Dataset,
      isCategorical: true,
      label: "greater than",
      treatAsCategorical: true
    };

    const wrapper = shallow(
      <FilterList filters={filters} jointDataset={jointDataset} />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it("Should filter out undefined filter", () => {
    const filters = [
      {
        arg: [12.09],
        column: "alcohol",
        method: FilterMethods.LessThan
      },
      {
        arg: [2.5],
        column: "ash",
        method: FilterMethods.GreaterThan
      },
      undefined as unknown as IFilter
    ];

    jointDataset.metaDict.alcohol = {
      abbridgedLabel: "l",
      category: ColumnCategories.Dataset,
      isCategorical: true,
      label: "less than",
      treatAsCategorical: true
    };
    jointDataset.metaDict.ash = {
      abbridgedLabel: "g",
      category: ColumnCategories.Dataset,
      isCategorical: true,
      label: "greater than",
      treatAsCategorical: true
    };

    const wrapper = shallow(
      <FilterList filters={filters} jointDataset={jointDataset} />
    );
    expect(wrapper).toMatchSnapshot();
  });
});

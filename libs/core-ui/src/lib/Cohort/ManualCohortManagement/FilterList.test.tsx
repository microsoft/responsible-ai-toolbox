// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IColumnRange, RangeTypes } from "@responsible-ai/mlchartlib";
import { shallow } from "enzyme";
import React from "react";

import { defaultModelAssessmentContext } from "../../Context/ModelAssessmentContext";
import { FilterMethods, IFilter } from "../../Interfaces/IFilter";

import { FilterList } from "./FilterList";

describe("FilterList", () => {
  const ranges: { [key: string]: IColumnRange } = {
    alcohol: {
      max: 13,
      min: 0.1,
      rangeType: RangeTypes.Numeric,
      sortedUniqueValues: [0.1, 13]
    },
    ash: {
      max: 5,
      min: 0.3,
      rangeType: RangeTypes.Numeric,
      sortedUniqueValues: [0.3, 1, 4, 5]
    }
  };
  beforeEach(() => {
    defaultModelAssessmentContext.columnRanges = ranges;
  });

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

    const wrapper = shallow(<FilterList filters={filters} />);
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

    const wrapper = shallow(<FilterList filters={filters} />);
    expect(wrapper).toMatchSnapshot();
  });
});

// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Label, Text } from "@fluentui/react";
import { localization } from "@responsible-ai/localization";
import { ICategoricalRange, INumericRange } from "@responsible-ai/mlchartlib";
import React from "react";

import { ICompositeFilter, IFilter } from "../../Interfaces/IFilter";
import { getCompositeFilterString } from "../../util/getCompositeFilterString";
import { JointDataset } from "../../util/JointDataset";

import { CompositeFilterList } from "./CompositeFilterList";
import { FilterList } from "./FilterList";

export interface ICohortEditorFilterList {
  legacyFilters: IFilter[];
  filters: IFilter[];
  compositeFilters: ICompositeFilter[];
  jointDataset: JointDataset;
  columnRanges?: { [key: string]: INumericRange | ICategoricalRange };
  isRefactorFlightOn?: boolean;
  editFilter?(index: number): void;
  removeFilter?(index: number): void;
  removeCompositeFilter?(index: number): void;
}

export class CohortEditorFilterList extends React.Component<ICohortEditorFilterList> {
  public render(): React.ReactNode {
    const compositeStrings = getCompositeFilterString(
      this.props.compositeFilters,
      this.props.jointDataset
    );
    const filters = this.props.isRefactorFlightOn
      ? this.props.filters
      : this.props.legacyFilters;
    return (
      <>
        <Label>{localization.Interpret.CohortEditor.addedFilters}</Label>
        <FilterList
          legacyFilters={this.props.legacyFilters}
          filters={this.props.filters}
          jointDataset={this.props.jointDataset}
          isRefactorFlightOn={this.props.isRefactorFlightOn}
          columnRanges={this.props.columnRanges}
          editFilter={this.props.editFilter}
          removeFilter={this.props.removeFilter}
        />
        <CompositeFilterList
          compositeStrings={compositeStrings}
          jointDataset={this.props.jointDataset}
          removeFilter={this.props.removeCompositeFilter}
        />
        {filters.length + this.props.compositeFilters.length === 0 && (
          <div>
            <Text variant={"smallPlus"}>
              {localization.Interpret.CohortEditor.noAddedFilters}
            </Text>
          </div>
        )}
      </>
    );
  }
}
